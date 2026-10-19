console.log("receptionist-login.js loaded");

const SUPABASE_URL = "https://cfnblxsmgattidymaqjb.supabase.co";
const SUPABASE_KEY = "sb_publishable_zkZUJJa7hj8tWd8tPRxJUA_iJVk_TgG";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    loginMessage.textContent = "Signing in...";

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        loginMessage.textContent = "Login failed. Check your email and password.";
        console.error(error.message);
        return;
    }


    /*20/10/2026*/
   if (error) {
    loginMessage.textContent = "Login failed. Check your email and password.";
    console.error("Supabase login error:", error.message);
    return;
}

console.log("Supabase login successful.");
console.log("Redirecting to receptionist-dashboard.html");

window.location.href = "receptionist-dashboard.html";
 /*20/10/2026*/

});