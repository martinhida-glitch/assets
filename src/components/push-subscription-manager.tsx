"use client";

import { useEffect, useState } from "react";

const VAPID_PUBLIC_KEY = "BHuG6c57uESkdrc_Y6agwVlq2-L3S16l0i7HIfkXEJAe_TMpwUo_U5KedHEB9LSFYrokYOi_uKV3QUhGnbqH4kw";

type PushState = "checking" | "unsupported" | "denied" | "disabled" | "enabled" | "error";

function applicationServerKey(value: string): ArrayBuffer {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let index = 0; index < raw.length; index += 1) output[index] = raw.charCodeAt(index);
  return output.buffer;
}

async function saveSubscription(subscription: PushSubscription) {
  const response = await fetch("/api/push/subscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription.toJSON()),
  });
  if (!response.ok) throw new Error("No se pudo guardar la suscripción.");
}

export function PushSubscriptionManager() {
  const [state, setState] = useState<PushState>("checking");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function check() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        if (active) setState("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        if (active) setState("denied");
        return;
      }
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        const subscription = await registration.pushManager.getSubscription();
        if (!active) return;
        setState(subscription ? "enabled" : "disabled");
        if (subscription) await saveSubscription(subscription);
      } catch {
        if (active) setState("error");
      }
    }
    void check();
    return () => { active = false; };
  }, []);

  async function enable() {
    setBusy(true);
    setMessage("");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "disabled");
        setMessage("No se otorgó permiso para mostrar notificaciones.");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      const subscription = existing || await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey(VAPID_PUBLIC_KEY),
      });
      await saveSubscription(subscription);
      setState("enabled");
      setMessage("Este dispositivo ya puede recibir avisos aunque ALTOQUE esté cerrada.");
    } catch (error) {
      console.error(error);
      setState("error");
      setMessage("No pudimos activar las notificaciones en este dispositivo.");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setMessage("");
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push/subscriptions", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setState("disabled");
      setMessage("Las notificaciones push quedaron desactivadas en este dispositivo.");
    } catch (error) {
      console.error(error);
      setState("error");
      setMessage("No pudimos desactivar completamente este dispositivo.");
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
