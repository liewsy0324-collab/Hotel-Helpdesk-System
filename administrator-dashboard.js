console.log("administrator-dashboard.js loaded");

const SUPABASE_URL = "https://cfnblxsmgattidymaqjb.supabase.co";
const SUPABASE_KEY = "sb_publishable_zkZUJJa7hj8tWd8tPRxJUA_iJVk_TgG";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
        auth: {
            storageKey: "hotel_administrator_auth"
        }
    }
);

const userTableBody = document.getElementById("user-table-body");
const addUserButton = document.getElementById("add-user-button");
const logoutButton = document.getElementById("logout-button");

async function loadUsers() {
    userTableBody.innerHTML = `
        <tr>
            <td colspan="6" class="empty-message">Loading user accounts...</td>
        </tr>
    `;

    const {
        data: { session },
        error: sessionError
    } = await supabaseClient.auth.getSession();

    console.log("Dashboard session email:", session?.user?.email);
console.log("Dashboard session user ID:", session?.user?.id);

    if (sessionError || !session) {
        window.location.href = "administrator-login.html";
        return;
    }

    const { data, error } = await supabaseClient.functions.invoke(
        "clever-task",
        {
            method: "POST"
        }
    );

   if (error) {
    console.error("Function request failed:", error);
    console.error("HTTP status:", error.context?.status);

    if (error.context instanceof Response) {
        console.error(
            "Function response details:",
            await error.context.clone().text()
        );
    }

    userTableBody.innerHTML = `
        <tr>
            <td colspan="7" class="empty-message">
                Unable to load user accounts. Please check the console.
            </td>
        </tr>
    `;
    return;
}

if (data?.error) {
    console.error("Function returned an error:", data.error);

    userTableBody.innerHTML = `
        <tr>
            <td colspan="7" class="empty-message">
                ${data.error}
            </td>
        </tr>
    `;
    return;
}

    const users = data.users || [];

    console.log("Users returned by Edge Function:", users);

    if (users.length === 0) {
        userTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-message">
                    No user accounts found.
                </td>
            </tr>
        `;
        return;
    }

    userTableBody.innerHTML = "";

    users.forEach(function (user) {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = user.employee_name || "—";

        const emailCell = document.createElement("td");
        emailCell.textContent = user.email;

        const roleCell = document.createElement("td");
        roleCell.textContent = user.role;

        const statusCell = document.createElement("td");
        statusCell.textContent = user.is_active ? "Active" : "Inactive";

        const dateCell = document.createElement("td");
        dateCell.textContent = new Date(user.created_at).toLocaleDateString();

        const editCell = document.createElement("td");

        const actionsCell = document.createElement("td");

        const deleteCell = document.createElement("td");

if (user.role === "receptionist") {
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.className = "edit-user-button";

    editButton.addEventListener("click", function () {
    document.getElementById("edit-user-id").value = user.id;
    document.getElementById("edit-user-name").value = user.employee_name || "";
    document.getElementById("edit-user-email").value = user.email || "";
    document.getElementById("edit-user-password").value = "";
    document.getElementById("edit-form-message").textContent = "";

    editUserModal.hidden = false;
    document.getElementById("edit-user-name").focus();
});

    editCell.appendChild(editButton);

    const statusButton = document.createElement("button");

    statusButton.textContent = user.is_active
        ? "Deactivate"
        : "Activate";

    statusButton.type = "button";

    statusButton.addEventListener("click", async function () {
        const newStatus = !user.is_active;

        const confirmed = confirm(
            `Are you sure you want to ${
                newStatus ? "activate" : "deactivate"
            } ${user.email}?`
    );

        if (!confirmed) {
            return;
        }

        statusButton.disabled = true;
        statusButton.textContent = "Updating...";

        try {
            const { data, error } =
                await supabaseClient.functions.invoke(
                    "clever-task",
                    {
                        body: {
                            action: "set_user_status",
                            user_id: user.id,
                            is_active: newStatus
                        }
                    }
                );

            if (error) {
    console.error("Status update request failed:", error);
    console.error("HTTP status:", error.context?.status);

    if (error.context instanceof Response) {
        console.error(
            "Function response details:",
            await error.context.clone().text()
        );
    }

    console.error("Returned data:", data);

    throw new Error(
        data?.error || "Unable to update account status."
    );
}

            if (data?.error || !data?.success) {
                throw new Error(
                    data?.error || "Account status update failed."
                );
            }

     

            await loadUsers();

        } catch (error) {
            console.error("Account status update error:", error);
            alert(error.message || "An unexpected error occurred.");
            statusButton.disabled = false;
            statusButton.textContent = user.is_active
                ? "Deactivate"
                : "Activate";
        }
    });

    actionsCell.appendChild(statusButton);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-user-button";

    deleteButton.addEventListener("click", async function () {
    const confirmed = confirm(
        `Are you sure you want to permanently delete ${user.email}? This action cannot be undone.`
    );

    if (!confirmed) {
        return;
    }

    deleteButton.disabled = true;
    deleteButton.textContent = "Deleting...";

    try {
        const { data, error } =
            await supabaseClient.functions.invoke(
                "clever-task",
                {
                    body: {
                        action: "delete_user",
                        user_id: user.id
                    }
                }
            );

        if (error) {
            console.error("Delete user request failed:", error);
            throw new Error(
                data?.error || "Unable to delete the account."
            );
        }

        if (data?.error || !data?.success) {
            throw new Error(
                data?.error || "Account deletion failed."
            );
        }

        alert("Receptionist account deleted successfully.");
        await loadUsers();

    } catch (error) {
        console.error("Delete user error:", error);
        alert(error.message || "An unexpected error occurred.");

        deleteButton.disabled = false;
        deleteButton.textContent = "Delete";
    }
});

        deleteCell.appendChild(deleteButton);

} else {
        actionsCell.textContent = "—";
        deleteCell.textContent = "—";

}

        row.append(
            nameCell,
            emailCell,
            roleCell,
            statusCell,
            dateCell,
            editCell,
            actionsCell,
            deleteCell
        );

        userTableBody.appendChild(row);
    });
}

const addUserModal = document.getElementById("add-user-modal");
const closeModalButton = document.getElementById("close-modal-button");
const cancelModalButton = document.getElementById("cancel-modal-button");
const addUserForm = document.getElementById("add-user-form");
const editUserModal = document.getElementById("edit-user-modal");
const closeEditModalButton = document.getElementById("close-edit-modal-button");
const cancelEditModalButton = document.getElementById("cancel-edit-modal-button");
const editUserForm = document.getElementById("edit-user-form");

addUserButton.addEventListener("click", function () {
addUserForm.reset();
document.getElementById("form-message").textContent = "";
addUserModal.hidden = false;
document.getElementById("user-email").focus();
});

function closeAddUserModal() {
addUserModal.hidden = true;
}

closeModalButton.addEventListener("click", closeAddUserModal);
cancelModalButton.addEventListener("click", closeAddUserModal);



function closeEditUserModal() {
    editUserModal.hidden = true;
}

closeEditModalButton.addEventListener("click", closeEditUserModal);
cancelEditModalButton.addEventListener("click", closeEditUserModal);

editUserModal.addEventListener("click", function (event) {
    if (event.target === editUserModal) {
        closeEditUserModal();
    }
});



addUserModal.addEventListener("click", function (event) {
if (event.target === addUserModal) {
closeAddUserModal();
}
});

addUserForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formMessage = document.getElementById("form-message");
    const createButton = addUserForm.querySelector(
        ".create-user-button"
    );

    const employeeName = document.getElementById("user-name").value.trim();
    const email = document.getElementById("user-email").value.trim();
    const password = document.getElementById("user-password").value;

    formMessage.textContent = "";
    createButton.disabled = true;
    createButton.textContent = "Creating...";

    try {
        const { data, error } = await supabaseClient.functions.invoke(
            "clever-task",
            {
                body: {
                    action: "create_user",
                    employee_name: employeeName,
                    email: email,
                    password: password
                }
            }
        );

        if (error) {
            console.error("Account creation request failed:", error);
            throw new Error(
                data?.error || "Unable to create the account. Please check the console."
            );
        }

        if (data?.error || !data?.success) {
            throw new Error(
                data?.error || "Account creation failed."
            );
        }

        addUserForm.reset();
        formMessage.style.color = "green";
        formMessage.textContent = "Receptionist account created successfully.";

        await loadUsers();

    } catch (error) {
        console.error("Create account error:", error);
        formMessage.style.color = "#b00020";
        formMessage.textContent =
            error.message || "An unexpected error occurred.";
    } finally {
        createButton.disabled = false;
        createButton.textContent = "Create Account";
    }
});



editUserForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formMessage = document.getElementById("edit-form-message");
    const saveButton = document.getElementById("save-edit-user-button");

    const userId = document.getElementById("edit-user-id").value;
    const employeeName = document.getElementById("edit-user-name").value.trim();
    const email = document.getElementById("edit-user-email").value.trim();
    const password = document.getElementById("edit-user-password").value;

    formMessage.textContent = "";
    saveButton.disabled = true;
    saveButton.textContent = "Saving...";

    try {
        const { data, error } = await supabaseClient.functions.invoke(
            "clever-task",
            {
                body: {
                    action: "update_user",
                    user_id: userId,
                    employee_name: employeeName,
                    email: email,
                    password: password
                }
            }
        );

        if (error) {
            console.error("Update user request failed:", error);
            throw new Error(
                data?.error || "Unable to update the account. Please check the console."
            );
        }

        if (data?.error || !data?.success) {
            throw new Error(data?.error || "Account update failed.");
        }

        formMessage.style.color = "green";
        formMessage.textContent = "Receptionist account updated successfully.";

        await loadUsers();

        document.getElementById("edit-user-password").value = "";
        closeEditUserModal();

    } catch (error) {
        console.error("Update user error:", error);
        formMessage.style.color = "#b00020";
        formMessage.textContent =
            error.message || "An unexpected error occurred.";
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = "Save Changes";
    }
});



logoutButton.addEventListener("click", async function () {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        alert("Unable to log out. Please try again.");
        console.error(error.message);
        return;
    }

    window.location.href = "administrator-login.html";
});

async function confirmExistingReceptionist() {
    const { data, error } = await supabaseClient.functions.invoke(
        "clever-task",
        {
            body: {
                action: "confirm_user",
                email: "johndoe11@gmail.com"
            }
        }
    );

    if (error) {
        console.error("Confirmation request failed:", error);
        alert("Unable to confirm account. Check the browser console.");
        return;
    }

    if (data?.error || !data?.success) {
        console.error("Confirmation error:", data?.error);
        alert(data?.error || "Confirmation failed.");
        return;
    }

    alert("Receptionist account confirmed successfully.");
    await loadUsers();
}

loadUsers();