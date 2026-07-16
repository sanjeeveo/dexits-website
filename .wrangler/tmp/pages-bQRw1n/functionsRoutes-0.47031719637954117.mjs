import { onRequestOptions as __api_lead_js_onRequestOptions } from "/sessions/nice-jolly-ptolemy/mnt/DEXITS/dexits-website/functions/api/lead.js"
import { onRequestPost as __api_lead_js_onRequestPost } from "/sessions/nice-jolly-ptolemy/mnt/DEXITS/dexits-website/functions/api/lead.js"
import { onRequestPost as __api_notify_js_onRequestPost } from "/sessions/nice-jolly-ptolemy/mnt/DEXITS/dexits-website/functions/api/notify.js"
import { onRequestOptions as __api_track_js_onRequestOptions } from "/sessions/nice-jolly-ptolemy/mnt/DEXITS/dexits-website/functions/api/track.js"
import { onRequestPost as __api_track_js_onRequestPost } from "/sessions/nice-jolly-ptolemy/mnt/DEXITS/dexits-website/functions/api/track.js"

export const routes = [
    {
      routePath: "/api/lead",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_lead_js_onRequestOptions],
    },
  {
      routePath: "/api/lead",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_lead_js_onRequestPost],
    },
  {
      routePath: "/api/notify",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_notify_js_onRequestPost],
    },
  {
      routePath: "/api/track",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_track_js_onRequestOptions],
    },
  {
      routePath: "/api/track",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_track_js_onRequestPost],
    },
  ]