export function getOS(): string {
  const userAgent = window.navigator.userAgent;
  let os: string = "Unknown OS";

  if (userAgent.indexOf("Win") != -1) {
    os = "Windows";
  } else if (userAgent.indexOf("Mac") != -1) {
    os = "MacOS";
  } else if (userAgent.indexOf("X11") != -1) {
    os = "UNIX";
  } else if (userAgent.indexOf("Linux") != -1) {
    os = "Linux";
  } else if (/Android/.test(userAgent)) {
    os = "Android";
  } else if (/iPhone|iPad|iPod/.test(userAgent)) {
    os = "iOS";
  }

  return os;
}
