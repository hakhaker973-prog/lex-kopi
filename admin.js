import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://xplpfjtmjlkqlpsfwuei.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_R_S9Mq8WwrUsWKYqGu7Yig_IhZ7q0HR";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const loginForm = document.getElementById("admin-login");
const loginMessage = document.getElementById("login-message");
const dashboard = document.getElementById("admin-dashboard");
const logoutButton = document.getElementById("admin-logout");

async function checkAdmin() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    loginForm.hidden = false;
    dashboard.hidden = true;
    return;
  }

  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (error || !data) {
    await supabase.auth.signOut();
    loginForm.hidden = false;
    dashboard.hidden = true;
    loginMessage.textContent = "Akun ini tidak memiliki akses admin.";
    return;
  }

  loginForm.hidden = true;
  dashboard.hidden = false;
}

loginForm.addEventListener("submit", async event => {
  event.preventDefault();

  loginMessage.textContent = "Memeriksa akun...";

  const email = document.getElementById("admin-email").value.trim();
  const password = document.getElementById("admin-password").value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    loginMessage.textContent = "Login gagal. Periksa email dan password.";
    return;
  }

  await checkAdmin();
});

logoutButton.addEventListener("click", async () => {
  await supabase.auth.signOut();

  loginForm.hidden = false;
  dashboard.hidden = true;
  loginMessage.textContent = "Kamu sudah keluar dari akun admin.";
});

checkAdmin();
