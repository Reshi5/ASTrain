import { NextRequest, NextResponse } from "next/server";
import * as process from "process";
import { routes } from "@utils/routes";
import { verifyTokenInRequest } from "@lib/auth";
import IUser from "./interfaces/IUser";
import csrf from "edge-csrf";

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
    // "/dashboard",
    // "/api/",
  ],
};

// TODO CSRF protection https://github.com/amorey/edge-csrf/tree/0.2.1
// initalize protection function
const csrfProtect = csrf();

const redirectToHome = () => {
  return NextResponse.redirect(process.env.BASE_URL as string);
};

const redirectAPI = (req: NextRequest) => {
  req.nextUrl.searchParams.set("from", req.nextUrl.pathname);
  req.nextUrl.pathname = `${process.env.BASE_URL as string}/login`;
  return NextResponse.redirect(req.nextUrl);
};

export default async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  console.log("[middleware in request.url]", request.url);
  console.log(
    "[middleware request.nextUrl.pathname]",
    request.nextUrl.pathname
  );

  // csrf protection
  const csrfError = await csrfProtect(request, response);

  //get the actual request path
  const path = request.nextUrl.pathname.split("/");

  // do not protect homepage
  if (path[1] === "") {
    console.log("homepage [middleware exit]");
    return response;
  }
  // do not protect authenticate api
  if (
    request.nextUrl.pathname.startsWith("/api/authenticate") ||
    request.nextUrl.pathname.startsWith("/api/signup") ||
    request.nextUrl.pathname.startsWith("/api/logout")
  ) {
    console.log("unprotected route, [middleware exit]");
    return response;
  }

  const verifiedToken = await verifyTokenInRequest(request).catch((err) => {
    console.error("[verifyAuth error:", err.message, "]");
  });

  // redirect to home tried to re-authenticate logged-in user, or pass through
  if (
    request.nextUrl.pathname.startsWith("/signup") ||
    request.nextUrl.pathname.startsWith("/login")
  ) {
    if (verifiedToken) {
      console.log(
        "auth page within authenticated session, redirect to homepage [middleware exit]"
      );
      return redirectToHome();
    } else {
      return response;
    }
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    // check CSRF
    if (csrfError) {
      console.log(
        `CSRF Error: [${csrfError}]. API request redirect [middleware exit]`
      );
      return redirectAPI(request);
    }
    if (!verifiedToken) {
      console.log("no token found. api request redirect [middleware exit]");
      return redirectAPI(request);
    }
  } else {
    if (!verifiedToken) {
      console.log("no token found, non-api redirect [middleware exit]");
      return redirectToHome();
    }

    let { role } = verifiedToken as unknown as IUser;

    const currentPath = routes.find((route) => route.path === path[1]);
    const allowed = currentPath?.allowedRoles.includes(role);
    if (allowed) {
      console.log("[", currentPath?.path, "] allowed [middleware exit]");
      return response;
    } else {
      console.log("[", currentPath?.path, "] isn't allowed [middleware exit]");
      return redirectToHome();
    }
  }
}
