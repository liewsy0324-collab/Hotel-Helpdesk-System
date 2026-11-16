console.log("receptionist-login.js loaded");

const SUPABASE_URL = "https://cfnblxsmgattidymaqjb.supabase.co";
const SUPABASE_KEY = "sb_publishable_zkZUJJa7hj8tWd8tPRxJUA_iJVk_TgG";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
        auth: {
            storageKey: "hotel_receptionist_auth"
        }
    }
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
        loginMessage.textContent =
            "Login failed. Check your email and password.";
        console.error("Supabase login error:", error.message);
        return;
    }

    const userId = data.user.id;

    const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("role, is_active")
        .eq("id", userId)
        .single();

    if (
        profileError ||
        !profile ||
        profile.role !== "receptionist" ||
        profile.is_active !== true
    ) {
        await supabaseClient.auth.signOut({ scope: "local" });

        if (profile && profile.is_active === false) {
            loginMessage.textContent =
                "Your account is inactive. Please contact the administrator.";
        } else if (profile && profile.role !== "receptionist") {
            loginMessage.textContent =
                "This login is for receptionist accounts only.";
        } else {
            loginMessage.textContent =
                "Unable to verify your account. Please try again.";
        }

        console.error("Account verification failed:", profileError);
        return;
    }

    console.log("Active receptionist account verified.");
    window.location.href = "receptionist-dashboard.html";
});