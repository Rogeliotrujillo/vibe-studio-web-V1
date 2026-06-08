import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import JSZip from "jszip";
import fs from "fs";

// Helper to extract base64 components safely
function parseBase64Image(dataString: string) {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return null;
  }
  return {
    type: matches[1],
    data: Buffer.from(matches[2], 'base64'),
    extension: matches[1].split('/')[1] || 'png'
  };
}

const DB_PATH = path.join(process.cwd(), "orders_db.json");

// SUPABASE CONFIGURATION
const rawSupabaseUrl = process.env.SUPABASE_URL || "https://stlfwwxzawwwlmpbtuex.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0bGZ3d3h6YXd3d2xtcGJ0dWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMTI1NjMsImV4cCI6MjA5NTU4ODU2M30.6jJ0vnYp4XBhBgvXW5tgfe3fF3cKBxRd0tnpCLbT0qM";

// Clean base URL (strip trailing slashes and any trailing /rest/v1 or /rest/v1/)
const cleanBaseUrl = (() => {
  let u = rawSupabaseUrl.trim().replace(/\/+$/, "");
  if (u.endsWith("/rest/v1")) {
    u = u.slice(0, -8);
  }
  return u;
})();

const SUPABASE_URL = `${cleanBaseUrl}/rest/v1`;

// General utility to send requests to Supabase PostgREST api securely
async function supabaseRequest(endpoint: string, method: string = "GET", body: any = null) {
  try {
    const url = `${SUPABASE_URL}/${endpoint}`;
    const headers: any = {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    };

    if (method !== "GET" && method !== "DELETE") {
      headers["Prefer"] = "return=representation";
    }

    const options: any = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[Supabase Error] ${method} ${endpoint}: ${response.status} - ${errorText}`);
      return null;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : { success: true };
  } catch (err: any) {
    console.warn(`[Supabase Connection Fail] ${method} ${endpoint}:`, err.message);
    return null;
  }
}

interface OrderRecord {
  id: string;
  type: 'preview' | 'order';
  emailData: any;
  clientInvoice: any;
  status: 'to_be_completed' | 'in_progress' | 'completed';
  deleted: boolean;
  deletedAt: string | null;
  createdAt: string;
}

interface DatabaseSchema {
  orders: OrderRecord[];
  config: {
    trashRetentionDays: number;
    adminPassword?: string;
  };
}

function getDB(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initial: DatabaseSchema = { orders: [], config: { trashRetentionDays: 30, adminPassword: "1234" } };
      fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const parsed = JSON.parse(raw) as DatabaseSchema;
    if (!parsed.config) {
      parsed.config = { trashRetentionDays: 30, adminPassword: "1234" };
    } else if (!parsed.config.adminPassword) {
      parsed.config.adminPassword = "1234";
    }
    return parsed;
  } catch (e) {
    console.error("Error reading database file, returning default schema:", e);
    return { orders: [], config: { trashRetentionDays: 30, adminPassword: "1234" } };
  }
}

function saveDB(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving database file:", e);
  }
}

// Supabase sync functions
async function syncOrderToSupabase(order: any, isDeletedPermanently = false) {
  if (isDeletedPermanently) {
    await supabaseRequest(`orders?id=eq.${order.id}`, "DELETE");
    return;
  }

  const dbPayload = {
    id: order.id,
    type: order.type,
    email_data: order.emailData,
    client_invoice: order.clientInvoice,
    status: order.status,
    deleted: order.deleted,
    deleted_at: order.deletedAt,
    created_at: order.createdAt
  };

  const existing = await supabaseRequest(`orders?id=eq.${order.id}`, "GET");
  if (existing && existing.length > 0) {
    await supabaseRequest(`orders?id=eq.${order.id}`, "PATCH", dbPayload);
  } else {
    await supabaseRequest("orders", "POST", dbPayload);
  }
}

async function syncConfigToSupabase(key: string, value: any) {
  const existing = await supabaseRequest(`vibe_config?key=eq.${key}`, "GET");
  if (existing && existing.length > 0) {
    await supabaseRequest(`vibe_config?key=eq.${key}`, "PATCH", { value });
  } else {
    await supabaseRequest("vibe_config", "POST", { key, value });
  }
}

async function loadConfigFromSupabase() {
  const configs = await supabaseRequest("vibe_config", "GET");
  if (configs && Array.isArray(configs)) {
    console.log(`[Supabase Sync] Loading configuration from Supabase...`);
    const db = getDB();
    let updated = false;
    for (const entry of configs) {
      if (entry.key === "trashRetentionDays") {
        db.config.trashRetentionDays = Number(entry.value);
        updated = true;
      } else if (entry.key === "adminPassword") {
        db.config.adminPassword = String(entry.value);
        updated = true;
      }
    }
    if (updated) {
      saveDB(db);
    }
  }
}

async function loadOrdersFromSupabase() {
  const dbOrders = await supabaseRequest("orders", "GET");
  if (dbOrders && Array.isArray(dbOrders)) {
    console.log(`[Supabase Sync] Loading orders from Supabase...`);
    const db = getDB();
    let updated = false;
    for (const dbOrder of dbOrders) {
      const mappedOrder: OrderRecord = {
        id: dbOrder.id,
        type: dbOrder.type,
        emailData: dbOrder.email_data,
        clientInvoice: dbOrder.client_invoice,
        status: dbOrder.status,
        deleted: dbOrder.deleted,
        deletedAt: dbOrder.deleted_at,
        createdAt: dbOrder.created_at || new Date().toISOString()
      };
      
      const localIdx = db.orders.findIndex(o => o.id === mappedOrder.id);
      if (localIdx === -1) {
        db.orders.push(mappedOrder);
        updated = true;
      } else {
        db.orders[localIdx] = mappedOrder;
        updated = true;
      }
    }
    if (updated) {
      saveDB(db);
    }
  }
}


async function startServer() {
  const app = reportExpressSetup();
  const PORT = 3000;

  // Set payload size limit high to support multiple base64 references
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Pull configurations & orders from Supabase on start-up
  console.log("[Vibe Backend] Reaching out to Supabase to sync states...");
  try {
    await loadConfigFromSupabase();
    await loadOrdersFromSupabase();
  } catch (err: any) {
    console.warn("[Vibe Backend] Initial Supabase loading skipped (tables may not have been created yet):", err.message);
  }

  // API Route: Submit Order (saves to orders_db.json persistently)
  app.post("/api/send-email", async (req, res) => {
    try {
      const { type, emailData, clientInvoice } = req.body;

      if (!type) {
        return res.status(400).json({ error: "Missing type specification ('preview' or 'order')" });
      }

      console.log(`[Vibe Backend] Registering new ${type} submission locally...`);

      // Initialize JSZip container to package all documents/images elegantly to make sure it doesn't fail
      const zip = new JSZip();

      // Formulate a clean plain-text summary document for the zip
      let infoDoc = `==================================================\n`;
      infoDoc += `           VIBE STUDIO SPECIAL REQUEST             \n`;
      infoDoc += `==================================================\n\n`;
      infoDoc += `TIPO: ${type === "preview" ? "SOLICITUD DE PREVIEW GRATUITA" : "ORDEN DE CONFIGURACIÓN WEB COMPLETA"}\n`;
      infoDoc += `ID REGISTRO: ${emailData.id || "N/A"}\n`;
      infoDoc += `FECHA DE SOLICITUD: ${new Date().toLocaleString("es-ES")}\n\n`;

      if (type === "preview") {
        infoDoc += `--- DATOS DEL CONTACTO ---\n`;
        infoDoc += `Nombre completo: ${emailData.fullName}\n`;
        infoDoc += `Negocio/Rubro: ${emailData.businessName}\n`;
        infoDoc += `Instagram o TikTok: @${emailData.instagramOrTiktok?.replace("@", "")}\n\n`;
        infoDoc += `--- NECESIDADES Y LOGROS ESPERADOS ---\n`;
        infoDoc += `${emailData.goals || emailData.needs || ""}\n`;

        zip.file("detalles_solicitud_preview.txt", infoDoc);
      } else {
        infoDoc += `--- DATOS DEL NEGOCIO ---\n`;
        infoDoc += `Nombre de la marca: ${emailData.businessName}\n`;
        infoDoc += `Servicios/Productos: ${emailData.servicesSoldCount || "No especificado"}\n`;
        infoDoc += `Red Social Provista: ${emailData.socialLink || "Ninguna"}\n`;
        infoDoc += `Canal de Contacto Elegido: ${emailData.contactChannel}\n\n`;
        infoDoc += `--- CONFIGURACIÓN AVANZADA ---\n`;
        infoDoc += `Textos cargados listos: ${emailData.hasTexts === "yes" ? "Sí, provistos" : emailData.hasTexts === "need_help" ? "Ideas sueltas (Ocupa ayuda)" : "No, redactar todo"}\n`;
        infoDoc += `Secciones adicionales: ${emailData.specialSections?.join(", ") || "Ninguna"}\n`;
        infoDoc += `Comentarios adicionales:\n${emailData.additionalDetails || "Ninguno"}\n`;

        zip.file("detalles_configuracion_proyecto.txt", infoDoc);

        // Text drafts
        if (emailData.textDraft) {
          zip.file("textos/borrador_textos_principales.txt", emailData.textDraft);
        }
        if (emailData.aboutUsText) {
          zip.file("textos/seccion_sobre_nosotros.txt", emailData.aboutUsText);
        }
        if (emailData.hoursText) {
          zip.file("textos/seccion_horarios_atencion.txt", emailData.hoursText);
        }
        if (emailData.faqText) {
          zip.file("textos/seccion_preguntas_frecuentes.txt", emailData.faqText);
        }

        // Palette
        if (emailData.colorPaletteImage && emailData.colorPaletteFileName) {
          const parsed = parseBase64Image(emailData.colorPaletteImage);
          if (parsed) {
            zip.file(`paleta_colores/${emailData.colorPaletteFileName}`, parsed.data);
          }
        }

        // References
        if (emailData.uploadedReferences && emailData.uploadedReferences.length > 0) {
          emailData.uploadedReferences.forEach((ref: any, index: number) => {
            const parsed = parseBase64Image(ref.base64);
            const ext = parsed ? parsed.extension : "png";
            const filename = ref.name || `referencia_diseño_${index + 1}.${ext}`;
            if (parsed) {
              zip.file(`referencias_diseño/${filename}`, parsed.data);
            }
          });
        }

        // Gallery Items
        if (emailData.galleryItems && emailData.galleryItems.length > 0) {
          emailData.galleryItems.forEach((item: any, index: number) => {
            if (item.base64) {
              const parsed = parseBase64Image(item.base64);
              const ext = parsed ? parsed.extension : "png";
              const filename = item.fileName || `galeria_item_${index + 1}.${ext}`;
              const descContent = item.desc ? `Descripción: ${item.desc}` : "Sin descripción";
              
              if (parsed) {
                zip.file(`galeria_imagenes/${filename}`, parsed.data);
              }
              zip.file(`galeria_imagenes/${filename}.txt`, descContent);
            }
          });
        }
      }

      // Build invoice details
      const ticketRef = clientInvoice?.invoiceNumber || emailData.id || `VIBE-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const bizName = clientInvoice?.businessName || emailData.businessName || "Negocio";
      const userContact = clientInvoice?.contactChannel || emailData.fullName || emailData.contactChannel || "Contacto";
      const isPreview = type === "preview";
      const priceUSD = isPreview ? 0 : (clientInvoice?.price ?? 20);
      const statusTitle = isPreview ? "PREVIEW GRATUITA - SIN COMPROMISO" : "VERIFICABLE - CONTRA ENTREGA DE LA WEB";

      // Construct Invoice representation in HTML format
      const invoiceHTML = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 40px; border: 1px solid #f0f0f0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); color: #333;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td>
                <div style="font-size: 24px; font-weight: 900; color: #494bd6; letter-spacing: -1px;">Vibe Studio</div>
                <div style="font-size: 11px; color: #777; margin-top: 4px; font-family: monospace;">ALTA COSTURA DIGITAL</div>
              </td>
              <td style="text-align: right;">
                <div style="font-size: 11px; font-weight: bold; color: #494bd6; font-family: monospace; text-transform: uppercase;">${isPreview ? "VALE DE PREVIEW GRATUITA" : "FACTURA PROFORMA"}</div>
                <div style="font-size: 16px; font-weight: bold; color: #111; margin-top: 4px;">#${ticketRef}</div>
              </td>
            </tr>
          </table>

          <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;" />

          <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 30px;">
            <tr>
              <td style="width: 50%; vertical-align: top;">
                <div style="font-weight: bold; color: #888; font-size: 10px; text-transform: uppercase; margin-bottom: 6px; font-family: monospace;">PROVEEDOR:</div>
                <div style="font-weight: bold; color: #111;">Vibe Studio webs</div>
                <div style="color: #666;">vibe.studio.webs@gmail.com</div>
                <div style="color: #666;">Santiago, Chile / Envío Internacional</div>
              </td>
              <td style="width: 50%; vertical-align: top; text-align: right;">
                <div style="font-weight: bold; color: #888; font-size: 10px; text-transform: uppercase; margin-bottom: 6px; font-family: monospace;">EMITIDO PARA:</div>
                <div style="font-weight: bold; color: #111;">${bizName}</div>
                <div style="color: #666;">Contacto: ${userContact}</div>
                <div style="color: #666;">Fecha: ${new Date().toLocaleDateString("es-ES")}</div>
              </td>
            </tr>
          </table>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 30px;">
            <thead>
              <tr style="border-bottom: 2px solid #eee;">
                <th style="text-align: left; padding: 10px 0; color: #666; font-size: 11px; font-family: monospace;">CONCEPTO</th>
                <th style="text-align: right; padding: 10px 0; color: #666; font-size: 11px; font-family: monospace;">CANTIDAD</th>
                <th style="text-align: right; padding: 10px 0; color: #666; font-size: 11px; font-family: monospace;">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #f9f9f9;">
                <td style="padding: 15px 0;">
                  <div style="font-weight: bold; color: #111;">${isPreview ? "Diseño de Concepto / Preview Interactiva" : "Licencia Completa / Web Corporativa de Alta Moda"}</div>
                  <div style="font-size: 11px; color: #777; margin-top: 4px;">${isPreview ? "Boceto de alta costura digital y maquetación preliminar interactiva sin compromiso" : "Estructura Premium autogestionable, hosting incluido y soporte técnico prioritario"}</div>
                </td>
                <td style="text-align: right; padding: 15px 0; color: #555;">1</td>
                <td style="text-align: right; padding: 15px 0; font-weight: bold; color: #111;">${isPreview ? "$0.00 USD (Gratis)" : `$${priceUSD} USD`}</td>
              </tr>
            </tbody>
          </table>

          ${isPreview ? `
          <div style="background: #fbfbfb; border: 1px solid #eee; border-radius: 8px; padding: 20px; text-align: right; font-size: 14px; margin-bottom: 30px;">
            <span style="color: #666; font-size: 11px; font-family: monospace;">VALOR DE DESARROLLO:</span>
            <span style="font-size: 20px; font-weight: 900; color: #10b981; margin-left: 10px;">GRATUITA ($0.0)</span>
            <div style="font-size: 10px; color: #10b981; font-weight: bold; font-family: monospace; margin-top: 6px; text-transform: uppercase;">✓ SIN COSTO Y SIN NINGÚN COMPROMISO</div>
          </div>

          <div style="font-size: 11px; line-height: 1.6; color: #777; background: #fafafa; border-radius: 8px; padding: 15px;">
            <strong style="color: #444;">Esa preview es totalmente gratuita:</strong><br />
            Este anticipo interactivo de diseño no tiene costo alguno ni requiere tarjetas de crédito o acuerdos de pago posterior. Maquetamos tu web basándonos en tu marca para que experimentes nuestro trabajo con total comodidad y sin presiones.
          </div>
          ` : `
          <div style="background: #fcfcff; border: 1px solid #eef0ff; border-radius: 8px; padding: 20px; text-align: right; font-size: 14px; margin-bottom: 30px;">
            <span style="color: #666; font-size: 12px; font-family: monospace;">TOTAL PRECIO TOTAL:</span>
            <span style="font-size: 22px; font-weight: 900; color: #494bd6; margin-left: 10px;">$${priceUSD} USD</span>
            <div style="font-size: 10px; color: #10b981; font-weight: bold; font-family: monospace; margin-top: 6px; text-transform: uppercase;">✓ ESTADO: ${statusTitle}</div>
          </div>

          <div style="font-size: 11px; line-height: 1.6; color: #777; background: #fafafa; border-radius: 8px; padding: 15px;">
            <strong style="color: #444;">Nota Legal & Acuerdos:</strong><br />
            Una vez que nuestro equipo termine de maquetar la totalidad del sitio (estimado en 2 - 5 días hábiles), te enviaremos el enlace para que compruebes su perfecto funcionamiento. Los arreglos de pago único y traspaso de credenciales se realizarán una vez estés 100% conforme.
          </div>
          `}

          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0 15px 0;" />
          <div style="text-align: center; font-size: 10px; color: #aaa; font-family: monospace;">
            VIBE STUDIO &copy; 2026 &bull; ALTA COSTURA DIGITAL &bull; COD: ${ticketRef}
          </div>
        </div>
      `;

      // Save order to persistent file-database
      const db = getDB();
      const newRecord: OrderRecord = {
        id: ticketRef,
        type: type,
        emailData: emailData,
        clientInvoice: {
          invoiceNumber: ticketRef,
          businessName: bizName,
          contactChannel: userContact,
          price: priceUSD,
          invoiceHTML: invoiceHTML
        },
        status: 'to_be_completed',
        deleted: false,
        deletedAt: null,
        createdAt: new Date().toISOString()
      };

      db.orders.push(newRecord);
      saveDB(db);

      // Real-time synchronization to Supabase database
      syncOrderToSupabase(newRecord).catch(err => {
        console.warn("[Supabase Sync Fail] Error syncing new order:", err.message);
      });

      console.log(`[Vibe Backend] Saved ${type} order ${ticketRef} persistently inside DB.`);

      // Return both success status, invoice info, and the complete HTML invoice to render dynamically!
      return res.status(200).json({
        success: true,
        simulated: true,
        invoiceNumber: ticketRef,
        invoiceHTML: invoiceHTML
      });

    } catch (err: any) {
      console.error("[Vibe Backend] Critical Error in /api/send-email API route:", err);
      return res.status(500).json({ error: "Failed to process order locally in backend", details: err.message });
    }
  });

  // Admin Routes:
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    const db = getDB();
    const currentPass = db.config?.adminPassword || "1234";
    if (password === currentPass) {
      return res.status(200).json({ success: true });
    }
    return res.status(401).json({ success: false, error: "Contraseña incorrecta" });
  });

  app.get("/api/admin/orders", async (req, res) => {
    try {
      const db = getDB();
      const retentionDays = db.config?.trashRetentionDays ?? 30;
      const nowMs = Date.now();
      const retentionMs = retentionDays * 24 * 60 * 60 * 1000;

      let updated = false;
      const filteredOrders: OrderRecord[] = [];

      for (const order of db.orders) {
        if (order.deleted && order.deletedAt) {
          const elapsed = nowMs - Date.parse(order.deletedAt);
          if (elapsed >= retentionMs) {
            updated = true;
            console.log(`[Vibe Backend] Expired recycling item. Purging ${order.id} permanently.`);
            // Sync deletion to Supabase
            try {
              await syncOrderToSupabase(order, true);
            } catch (err: any) {
              console.warn(`[Supabase Sync Fail] Error purging expired order ${order.id}:`, err.message);
            }
            continue; // Skip appending, thus permanently deleting
          }
        }
        filteredOrders.push(order);
      }

      if (updated) {
        db.orders = filteredOrders;
        saveDB(db);
      }

      return res.status(200).json({ orders: db.orders, config: db.config });
    } catch (error: any) {
      res.status(500).json({ error: "Error reading entries", details: error.message });
    }
  });

  app.put("/api/admin/orders/:id", (req, res) => {
    try {
      const { id } = req.params;
      const { status, deleted } = req.body;
      const db = getDB();
      const idx = db.orders.findIndex(o => o.id === id);
      if (idx === -1) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (status !== undefined) {
        db.orders[idx].status = status;
      }

      if (deleted !== undefined) {
        db.orders[idx].deleted = deleted;
        db.orders[idx].deletedAt = deleted ? new Date().toISOString() : null;
      }

      saveDB(db);

      // Sync changes to Supabase in background
      syncOrderToSupabase(db.orders[idx]).catch(err => {
        console.warn("[Supabase Sync Fail] Error updating order:", err.message);
      });

      return res.status(200).json({ success: true, order: db.orders[idx] });
    } catch (error: any) {
      res.status(500).json({ error: "Error updating entry", details: error.message });
    }
  });

  app.post("/api/admin/orders/:id/restore", (req, res) => {
    try {
      const { id } = req.params;
      const db = getDB();
      const idx = db.orders.findIndex(o => o.id === id);
      if (idx === -1) {
        return res.status(404).json({ error: "Order not found" });
      }
      db.orders[idx].deleted = false;
      db.orders[idx].deletedAt = null;
      saveDB(db);

      // Sync restore to Supabase
      syncOrderToSupabase(db.orders[idx]).catch(err => {
        console.warn("[Supabase Sync Fail] Error restoring order:", err.message);
      });

      return res.status(200).json({ success: true, order: db.orders[idx] });
    } catch (error: any) {
      res.status(500).json({ error: "Error restoring entry", details: error.message });
    }
  });

  app.delete("/api/admin/orders/:id/permanent", (req, res) => {
    try {
      const { id } = req.params;
      const db = getDB();
      const targetOrder = db.orders.find(o => o.id === id);
      const initialLength = db.orders.length;
      db.orders = db.orders.filter(o => o.id !== id);
      if (db.orders.length === initialLength) {
        return res.status(404).json({ error: "Order not found" });
      }
      saveDB(db);

      // Sync deletion to Supabase
      if (targetOrder) {
        syncOrderToSupabase(targetOrder, true).catch(err => {
          console.warn("[Supabase Sync Fail] Error permanently deleting order:", err.message);
        });
      }

      return res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Error deleting entry", details: error.message });
    }
  });

  app.put("/api/admin/config", (req, res) => {
    try {
      const { trashRetentionDays } = req.body;
      if (typeof trashRetentionDays !== "number" || trashRetentionDays < 1) {
        return res.status(400).json({ error: "Invalid retention days length" });
      }
      const db = getDB();
      db.config.trashRetentionDays = trashRetentionDays;
      saveDB(db);

      // Sync retention config changes to Supabase
      syncConfigToSupabase("trashRetentionDays", trashRetentionDays).catch(err => {
        console.warn("[Supabase Sync Fail] Error syncing trash retention configuration:", err.message);
      });

      return res.status(200).json({ success: true, config: db.config });
    } catch (error: any) {
      res.status(500).json({ error: "Error updating configs", details: error.message });
    }
  });

  // End point: Change admin passcode
  app.post("/api/admin/change-password", async (req, res) => {
    try {
      const { password, newPassword } = req.body;
      const db = getDB();
      const currentPass = db.config?.adminPassword || "1234";
      if (password !== currentPass) {
        return res.status(401).json({ error: "Contraseña actual incorrecta" });
      }

      if (!newPassword || newPassword.trim().length < 4) {
        return res.status(400).json({ error: "La nueva contraseña debe tener al menos 4 caracteres" });
      }

      db.config.adminPassword = newPassword.trim();
      saveDB(db);

      // Sync new passcode to Supabase
      await syncConfigToSupabase("adminPassword", db.config.adminPassword);

      return res.status(200).json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: "Error al cambiar contraseña", details: error.message });
    }
  });

  // Admin Export Route: Compiles ZIP archive dynamically and serves as browser download
  app.get("/api/admin/orders/:id/zip", async (req, res) => {
    try {
      const { id } = req.params;
      const db = getDB();
      const order = db.orders.find(o => o.id === id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const { type, emailData } = order;
      const zip = new JSZip();

      let infoDoc = `==================================================\n`;
      infoDoc += `           VIBE STUDIO SPECIAL REQUEST             \n`;
      infoDoc += `==================================================\n\n`;
      infoDoc += `TIPO: ${type === "preview" ? "SOLICITUD DE PREVIEW GRATUITA" : "ORDEN DE CONFIGURACIÓN WEB COMPLETA"}\n`;
      infoDoc += `ID REGISTRO: ${emailData.id || order.id || "N/A"}\n`;
      infoDoc += `FECHA DE SOLICITUD: ${new Date(order.createdAt).toLocaleString("es-ES")}\n\n`;

      if (type === "preview") {
        infoDoc += `--- DATOS DEL CONTACTO ---\n`;
        infoDoc += `Nombre completo: ${emailData.fullName}\n`;
        infoDoc += `Negocio/Rubro: ${emailData.businessName}\n`;
        infoDoc += `Instagram o TikTok: @${emailData.instagramOrTiktok?.replace("@", "")}\n\n`;
        infoDoc += `--- NECESIDADES Y LOGROS ESPERADOS ---\n`;
        infoDoc += `${emailData.goals || emailData.needs || ""}\n`;

        zip.file("detalles_solicitud_preview.txt", infoDoc);
      } else {
        infoDoc += `--- DATOS DEL NEGOCIO ---\n`;
        infoDoc += `Nombre de la marca: ${emailData.businessName}\n`;
        infoDoc += `Servicios/Productos: ${emailData.servicesSoldCount || "No especificado"}\n`;
        infoDoc += `Red Social Provista: ${emailData.socialLink || "Ninguna"}\n`;
        infoDoc += `Canal de Contacto Elegido: ${emailData.contactChannel}\n\n`;
        infoDoc += `--- CONFIGURACIÓN AVANZADA ---\n`;
        infoDoc += `Textos cargados listos: ${emailData.hasTexts === "yes" ? "Sí, provistos" : emailData.hasTexts === "need_help" ? "Ideas sueltas (Ocupa ayuda)" : "No, redactar todo"}\n`;
        infoDoc += `Secciones adicionales: ${emailData.specialSections?.join(", ") || "Ninguna"}\n`;
        infoDoc += `Comentarios adicionales:\n${emailData.additionalDetails || "Ninguno"}\n`;

        zip.file("detalles_configuracion_proyecto.txt", infoDoc);

        if (emailData.textDraft) {
          zip.file("textos/borrador_textos_principales.txt", emailData.textDraft);
        }
        if (emailData.aboutUsText) {
          zip.file("textos/seccion_sobre_nosotros.txt", emailData.aboutUsText);
        }
        if (emailData.hoursText) {
          zip.file("textos/seccion_horarios_atencion.txt", emailData.hoursText);
        }
        if (emailData.faqText) {
          zip.file("textos/seccion_preguntas_frecuentes.txt", emailData.faqText);
        }

        if (emailData.colorPaletteImage && emailData.colorPaletteFileName) {
          const parsed = parseBase64Image(emailData.colorPaletteImage);
          if (parsed) {
            zip.file(`paleta_colores/${emailData.colorPaletteFileName}`, parsed.data);
          }
        }

        if (emailData.uploadedReferences && emailData.uploadedReferences.length > 0) {
          emailData.uploadedReferences.forEach((ref: any, index: number) => {
            const parsed = parseBase64Image(ref.base64);
            const ext = parsed ? parsed.extension : "png";
            const filename = ref.name || `referencia_diseño_${index + 1}.${ext}`;
            if (parsed) {
              zip.file(`referencias_diseño/${filename}`, parsed.data);
            }
          });
        }

        if (emailData.galleryItems && emailData.galleryItems.length > 0) {
          emailData.galleryItems.forEach((item: any, index: number) => {
            if (item.base64) {
              const parsed = parseBase64Image(item.base64);
              const ext = parsed ? parsed.extension : "png";
              const filename = item.fileName || `galeria_item_${index + 1}.${ext}`;
              const descContent = item.desc ? `Descripción: ${item.desc}` : "Sin descripción";
              
              if (parsed) {
                zip.file(`galeria_imagenes/${filename}`, parsed.data);
              }
              zip.file(`galeria_imagenes/${filename}.txt`, descContent);
            }
          });
        }
      }

      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename=VIBE_ORDEN_${order.id}.zip`);
      res.send(zipBuffer);
    } catch (err: any) {
      console.error("ZIP Generation Error:", err);
      res.status(500).json({ error: "Failed to generate ZIP", details: err.message });
    }
  });

  // Vite development middleware vs Static Production bundle
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("[Vibe Backend] Vite Development server middleware attached.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("[Vibe Backend] Serving static distribution folder.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Vibe Backend] Live full-stack server operating on http://0.0.0.0:${PORT}`);
  });
}

function reportExpressSetup() {
  return express();
}

startServer();

