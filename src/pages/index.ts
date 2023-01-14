import { APIContext } from "astro";

export function get({params, request}: APIContext) {
    return new Response(JSON.stringify({
        message: "Error not found"
    }), {
        status: 400
    })
}