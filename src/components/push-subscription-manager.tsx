"use client";

import { useEffect, useState } from "react";

const VAPID_PUBLIC_KEY = "BHuG6c57uESkdrc_Y6agwVlq2-L3S16l0i7HIfkXEJAe_TMpwUo_U5KedHEB9LSFYrokYOi_uKV3QUhGnbqH4kw";
const TIMEOUT_MS = 12_000;

type PushState = "checking" | "unsupported" | "denied" | "disabled" | "enabled" | "error";

function applicationServerKey(value: string): ArrayBuffer {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let index = 0; index < raw.length; index += 1) output[index] = raw.charCodeAt(index);
  return output.buffer;
}

function withTimeout<T>(promise: Promise<T>, code: string, ms = TIMEOUT_MS): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(code)), ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

async function waitUntilActive(registration: ServiceWorkerRegistration) {
  if (registration.active) return;
  const worker = registration.installing || registration.waiting;
  if (!worker) throw new Error("service_worker_inactive");
  if (registration.waiting) registration.waiting.postMessage({ type: "SKIP_WAITING" });

  await withTimeout(new Promise<void>((resolve, reject) => {
    if (worker.state === "activated") {
      resolve();
      return;
    }
    const onStateChange = () => {
      if (worker.state === "activated") {
        worker.removeEventListener("statechange", onStateChange);
        resolve();
      } else if (worker.state === "redundant") {
        worker.removeEventListener("statechange", onStateChange);
        reject(new Error("service_worker_redundant"));
      }
    };
    worker.addEventListener("statechange", onStateChange);
  }), "service_worker_activation_timeout");
}

async function getPushRegistration() {
  const registration = await withTimeout(
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }),
    "service_worker_registration_timeout",
  );
  void registration.update().catch(() => undefined);
  await waitUntilActive(registration);
  return registration;
}

async function saveSubscription(subscription: PushSubscription) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch("/api/push/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription.toJSON()),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("subscription_save_failed");
  } finally {
    window.clearTimeout(timer);
  }
}

function readableError(error: unknown) {
  const name = error instanceof DOMException ? error.name : "";
  const code = error instanceof Error ? error.message : "";

  if (name === "NotAllowedError") {
    return "El navegador bloqueó el permiso. Habilitá Notificaciones para ALTOQUE desde la configuración de Brave o Chrome.";
  }
  if (name === "AbortError" || code.includes("timeout") || code === "service_worker_inactive") {
    return "El visor interno no pudo completar la activación. Abrí el menú ⋮, elegí “Abrir en Brave” o “Abrir en navegador” y probá nuevamente en una pestaña normal.";
  }
  if (code === "subscription_save_failed") {
    return "El teléfono creó la suscripción, pero no pudimos guardarla. Recargá la página y probá otra vez.";
  }
  return "No pudimos activar las notificaciones en este dispositivo. Abrí ALTOQUE en una pestaña normal de Brave o Chrome y repetí la activación.";
}

export function PushSubscriptionManager() {
  const [state, setState] = useState<PushState>("checking");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function check() {
      if (!window.isSecureContext || !("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        if (active) setState("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        if (active) setState("denied");
        return;
      }
      try {
        const registration = await getPushRegistration();
        const subscription = await withTimeout(registration.pushManager.getSubscription(), "subscription_check_timeout");
        if (!active) return;
        setState(subscription ? "enabled" : "disabled");
        if (subscription) await saveSubscription(subscription);
      } catch (error) {
        if (active) {
          setState("disabled");
          setMessage(readableError(error));
        }
      }
    }
    void check();
    return () => { active = false; };
  }, []);

  async function enable() {
    setBusy(true);
    setMessage("");
    try {
      const permission = await withTimeout(Notification.requestPermission(), "permission_timeout");
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "disabled");
        setMessage("No se otorgó permiso para mostrar notificaciones.");
        return;
      }

      const registration = await getPushRegistration();
      const existing = await withTimeout(registration.pushManager.getSubscription(), "subscription_check_timeout");
      const subscription = existing || await withTimeout(
        registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey(VAPID_PUBLIC_KEY),
        }),
        "push_subscription_timeout",
      );

      await saveSubscription(subscription);
      setState("enabled");
      setMessage("Este dispositivo ya puede recibir avisos aunque ALTOQUE esté cerrada.");
    } catch (error) {
      console.error(error);
      setState(Notification.permission === "denied" ? "denied" : "disabled");
      setMessage(readableError(error));
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setMessage("");
    try {
      const registration = await getPushRegistration();
      const subscription = await withTimeout(registration.pushManager.getSubscription(), "subscription_check_timeout");
      if (subscription) {
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
        try {
          await fetch("/api/push/subscriptions", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
            signal: controller.signal,
          });
        } finally {
          window.clearTimeout(timer);
        }
        await withTimeout(subscription.unsubscribe(), "unsubscribe_timeout");
      }
      setState("disabled");
      setMessage("Las notificaciones push quedaron desactivadas en este dispositivo.");
    } catch (error) {
      console.error(error);
      setState("error");
      setMessage(readableError(error));
    } finally {
      setBusy(false);
    }
  }

  const title = state === "enabled" ? "Push activadas" : "Activar notificaciones push";
  const description = state === "enabled"
    ? "Recibirás avisos del sistema incluso cuando no tengas la aplicación abierta."
    : "Permití que ALTOQUE te avise cuando aparece una oportunidad o cambia una propuesta.";

  return <article className={`pushDeviceCard ${state}`}>
    <div className="pushDeviceIcon" aria-hidden="true">{state === "enabled" ? "✓" : "◉"}</div>
    <div className="pushDeviceCopy">
      <span className="sponsoredLabel">ESTE DISPOSITIVO</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <p className="pushBrowserHint">Para la primera activación, abrí ALTOQUE en una pestaña normal de Brave o Chrome, no dentro del visor de ChatGPT.</p>
      {state === "unsupported" && <p className="pushWarning">Este navegador no admite Web Push. En iPhone, instalá ALTOQUE en la pantalla de inicio y abrila desde allí.</p>}
      {state === "denied" && <p className="pushWarning">El permiso está bloqueado. Habilitá Notificaciones para este sitio desde la configuración del navegador.</p>}
      {message && <p className="pushStatusMessage">{message}</p>}
    </div>
    <div className="pushDeviceActions">
      {state === "enabled"
        ? <button type="button" className="ghostButton" disabled={busy} onClick={disable}>{busy ? "Procesando…" : "Desactivar aquí"}</button>
        : state !== "unsupported" && state !== "denied"
          ? <button type="button" className="primaryButton small" disabled={busy || state === "checking"} onClick={enable}>{busy ? "Activando…" : "Activar push"}</button>
          : null}
    </div>
  </article>;
}
