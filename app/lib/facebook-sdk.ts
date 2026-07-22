const META_APP_ID = "1047361974664451";
const SDK_ID = "facebook-jssdk";
const SDK_URL = "https://connect.facebook.net/vi_VN/sdk.js";

type LoginResponse = {
  authResponse?: { accessToken?: string };
  status?: string;
};

type FacebookSdk = {
  init(options: {
    appId: string;
    cookie: boolean;
    xfbml: boolean;
    version: string;
  }): void;
  login(
    callback: (response: LoginResponse) => void,
    options: { scope: string },
  ): void;
};

declare global {
  interface Window {
    FB?: FacebookSdk;
    fbAsyncInit?: () => void;
  }
}

let sdkPromise: Promise<FacebookSdk> | undefined;

export function loadFacebookSdk(): Promise<FacebookSdk> {
  if (window.FB) return Promise.resolve(window.FB);
  if (sdkPromise) return sdkPromise;

  const pending = new Promise<FacebookSdk>((resolve, reject) => {
    const timeout = window.setTimeout(
      () => reject(new Error("FACEBOOK_SDK_TIMEOUT")),
      15_000,
    );
    window.fbAsyncInit = () => {
      if (!window.FB) {
        window.clearTimeout(timeout);
        reject(new Error("FACEBOOK_SDK_UNAVAILABLE"));
        return;
      }
      window.clearTimeout(timeout);
      window.FB.init({
        appId: META_APP_ID,
        cookie: false,
        xfbml: false,
        version: "v23.0",
      });
      resolve(window.FB);
    };

    if (!document.getElementById(SDK_ID)) {
      const script = document.createElement("script");
      script.id = SDK_ID;
      script.src = SDK_URL;
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.onerror = () => {
        window.clearTimeout(timeout);
        reject(new Error("FACEBOOK_SDK_LOAD_FAILED"));
      };
      document.head.appendChild(script);
    }
  }).catch((error) => {
    document.getElementById(SDK_ID)?.remove();
    sdkPromise = undefined;
    throw error;
  });
  sdkPromise = pending;

  return pending;
}

export async function loginWithFacebook(): Promise<string> {
  await loadFacebookSdk();
  return new Promise((resolve, reject) => {
    if (!window.FB) {
      reject(new Error("FACEBOOK_SDK_UNAVAILABLE"));
      return;
    }
    window.FB.login((response) => {
      const accessToken = response.authResponse?.accessToken;
      if (!accessToken) {
        reject(new Error(response.status === "not_authorized"
          ? "FACEBOOK_NOT_AUTHORIZED"
          : "FACEBOOK_LOGIN_CANCELLED"));
        return;
      }
      resolve(accessToken);
    }, { scope: "public_profile" });
  });
}
