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

/*20-10-2026*/
const logoutButton = document.getElementById("logout-button");

logoutButton.addEventListener("click", function () {
    alert("Logout click detected!");
    window.location.href = "./receptionist-login.html";
});

/*20-10-2026*/



/*20-10-2026*/

window.signOutEverywhere = async function () {
    const { error } = await supabaseClient.auth.signOut({
        scope: "global"
    });

    if (error) {
        console.error("Sign-out failed:", error.message);
    } else {
        window.location.replace("receptionist-login.html");
    }
};

/*20-10-2026*/


supabaseClient.auth.getSession().then(function (result) {
    console.log("Current session:", result.data.session);
    console.log("Session error:", result.error);
});

/*19-10-2026*/

const createTicketButton = document.getElementById("create-ticket-button");
const ticketFormContainer = document.getElementById("ticket-form-container");
const ticketForm = document.getElementById("ticket-form");
const cancelTicketButton = document.getElementById("cancel-ticket-button");

/*19-10-2026*/

ticketForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const roomNumber = document.getElementById("room-number").value.trim();
    const problem = document.getElementById("problem").value.trim();
    const priority = document.getElementById("priority").value;
    const message = document.getElementById("ticket-form-message");

    message.textContent = "Saving ticket...";

    const { data, error } = await supabaseClient
        .from("maintenance_tickets")
        .insert([
            {
                room_number: roomNumber,
                problem: problem,
                priority: priority
            }
        ])
        .select();

    if (error) {
        console.error("Error saving ticket:", error.message);
        message.textContent = "Failed to save ticket. Please try again.";
        return;
    }


/*19/10/2026*/

    message.textContent = "Ticket saved successfully!";
console.log("Saved ticket:", data);

ticketForm.reset();
await loadTickets();

/*19/10/2026*/

});





    async function loadTickets() {
    const { data, error } = await supabaseClient
        .from("maintenance_tickets")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error loading tickets:", error.message);
        return;
    }

    const ticketList = document.getElementById("ticket-list");
    ticketList.innerHTML = "";

    data.forEach(function (ticket) {
        const row = document.createElement("tr");

        const values = [
            ticket.id,
            ticket.room_number,
            ticket.problem,
            ticket.priority,
            ticket.status
        ];

        values.forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        // View button
        const viewCell = document.createElement("td");
        const viewButton = document.createElement("button");

        viewButton.type = "button";
        viewButton.className = "view-button";
        viewButton.textContent = "View";

        viewButton.addEventListener("click", async function () {

    // Store the actual UUID for database operations
    document.getElementById("detail-ticket-id").dataset.ticketId = ticket.id;

    // Display the ticket ID
    document.getElementById("detail-ticket-id").textContent = ticket.id;

    // Display ticket information
    document.getElementById("detail-room").textContent = ticket.room_number;
    document.getElementById("detail-subject").textContent = ticket.problem;
    document.getElementById("detail-priority").textContent = ticket.priority;
    document.getElementById("detail-status").textContent = ticket.status;

     // Retrieve assignment information from Supabase
    const { data: assignment, error: assignmentError } = await supabaseClient
        .from("maintenance_assignments")
        .select("assigned_to, start_date, end_date, expected_finish_time")
        .eq("ticket_id", ticket.id)
        .maybeSingle();

    if (assignmentError) {
        console.error("Error loading assignment:", assignmentError.message);
    }

    // Display assignment information
    document.getElementById("assigned-to").textContent =
        assignment ? assignment.assigned_to : "Not assigned";

    document.getElementById("assignment-start-date").textContent =
        assignment ? new Date(assignment.start_date + "T00:00:00").toLocaleDateString("en-GB") : "-";

    document.getElementById("assignment-end-date").textContent =
        assignment ? new Date(assignment.end_date + "T00:00:00").toLocaleDateString("en-GB") : "-";

    document.getElementById("expected-finish-time").textContent =
        assignment ? assignment.expected_finish_time.substring(0, 5) : "-";

    document.getElementById("ticket-details-container").hidden = false;

});

        viewCell.appendChild(viewButton);
        row.appendChild(viewCell);

        ticketList.appendChild(row);
    });
}

/*20-10-2026*/


async function checkLogin() {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error || !data.session) {
        window.location.replace("receptionist-login.html");
        return false;
    }

    const userId = data.session.user.id;

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
        window.location.replace("receptionist-login.html");
        return false;
    }

    console.log("Active receptionist account verified.");
    return true;
}

/*20-10-2026*/





createTicketButton.addEventListener("click", function () {
    console.log("Create Ticket button clicked!");

    ticketFormContainer.hidden = false;

    console.log("Form hidden:", ticketFormContainer.hidden);
});



cancelTicketButton.addEventListener("click", function () {
    ticketFormContainer.hidden = true;
    ticketForm.reset();
});


async function testSupabaseConnection() {
    const { data, error } = await supabaseClient
        .from("maintenance_tickets")
        .select("id")
        .limit(1);

    if (error) {
        console.error("Supabase connection test failed:", error.message);
    } else {
        console.log("Supabase connection successful!");
        console.log(data);
    }
}

testSupabaseConnection();




const sidebar = document.getElementById("sidebar");
const hamburgerButton = document.getElementById("hamburger-button");

hamburgerButton.addEventListener("click", function () {
    sidebar.classList.toggle("expanded");
});

loadTickets();

const menuOptions = document.querySelectorAll(".menu-option");
const ticketPanel = document.getElementById("ticket-panel");
const panelTitle = document.getElementById("panel-title");

menuOptions.forEach(function (option) {
    option.addEventListener("click", function (event) {
        event.preventDefault();

        panelTitle.textContent = option.dataset.title;
        ticketPanel.hidden = false;
    });
});

menuOptions.forEach(function (option) {
    option.addEventListener("click", function (event) {
        event.preventDefault();

        menuOptions.forEach(function (item) {
            item.classList.remove("active");
        });

        option.classList.add("active");

        panelTitle.textContent = option.dataset.title;
        ticketPanel.hidden = false;
    });    
});

checkLogin();

const closeTicketDetailsButton = document.getElementById("close-ticket-details");

closeTicketDetailsButton.addEventListener("click", function () {
    document.getElementById("ticket-details-container").hidden = true;
});

// Work Consent Form
const addWorkConsentButton = document.getElementById("add-work-consent");
const workConsentFormContainer = document.getElementById("work-consent-form-container");
const ticketDetailsContainer = document.getElementById("ticket-details-container");
const cancelWorkConsentButton = document.getElementById("cancel-work-consent");
const workConsentForm = document.getElementById("work-consent-form");
const editWorkConsentButton =
    document.getElementById("edit-work-consent");

let workConsentMode = "add";


// Control Add and View modes
function setWorkConsentMode(mode) {

    const technicianInput =
        document.getElementById("consent-technician-name");

    const descriptionInput =
        document.getElementById("consent-work-description");

    const confirmButton =
        workConsentForm.querySelector('button[type="submit"]');

    const isReadOnly = mode === "view";

    technicianInput.readOnly = isReadOnly;
    descriptionInput.readOnly = isReadOnly;

    confirmButton.hidden = isReadOnly;
    cancelWorkConsentButton.hidden = isReadOnly;

    confirmButton.textContent =
        mode === "edit" ? "Save" : "Confirm";

    workConsentMode = mode;

    document.getElementById("consent-sender-row").hidden = mode !== "view";
    document.getElementById("consent-date-time-row").hidden = mode !== "view";
}

addWorkConsentButton.addEventListener("click", async function () {

    const ticketId =
        document.getElementById("detail-ticket-id").dataset.ticketId;

    if (!ticketId) {
        alert("Ticket ID is missing. Please reopen the ticket.");
        return;
    }

    // Check whether a Work Consent Form already exists

    const { data, error } = await supabaseClient
        .from("work_consent_forms")
        .select("ticket_id")
        .eq("ticket_id", ticketId)
        .maybeSingle();

    if (error) {
        alert("Failed to check Work Consent Form: " + error.message);
        return;
    }

    if (data) {
        alert("A Work Consent Form already exists for this ticket. Please use View.");
        return;
    }

    // Clear the form fields

    workConsentForm.reset();

    setWorkConsentMode("add");

    // Display ticket information

    document.getElementById("consent-ticket-id").textContent =
        document.getElementById("detail-ticket-id").textContent;

    document.getElementById("consent-room").textContent =
        document.getElementById("detail-room").textContent;

    document.getElementById("consent-subject").textContent =
        document.getElementById("detail-subject").textContent;

    // Hide sender and date/time in Add mode

    document.getElementById("consent-sender-row").hidden = true;

    document.getElementById("consent-date-time-row").hidden = true;

    // Open the form

    ticketDetailsContainer.hidden = true;
    workConsentFormContainer.hidden = false;

});


// Cancel Work Consent Form
cancelWorkConsentButton.addEventListener("click", function () {

    workConsentFormContainer.hidden = true;
    ticketDetailsContainer.hidden = false;

    workConsentForm.reset();
});

const closeWorkConsentButton = document.getElementById("close-work-consent");

closeWorkConsentButton.addEventListener("click", function () {
    workConsentFormContainer.hidden = true;
    ticketDetailsContainer.hidden = false;
    workConsentForm.reset();
});


// Save or Update Work Consent Form

workConsentForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const ticketId =
        document.getElementById("detail-ticket-id").dataset.ticketId;

    const technicianName =
        document.getElementById("consent-technician-name").value.trim();

    const workDescription =
        document.getElementById("consent-work-description").value.trim();

    if (completionRecordMode === "edit") {

    // Get the currently logged-in receptionist

    const { data: { session }, error: sessionError } =
        await supabaseClient.auth.getSession();

    if (sessionError || !session) {
        alert("Unable to identify the logged-in employee. Please log in again.");
        return;
    }

    // Update existing Completion Record

    const { data, error } = await supabaseClient
        .from("completion_record_forms")
        .update({
            technician_name: technicianName,
            work_performed: workPerformed,
            completion_time: completionTime,
            sender_id: session.user.id
        })
        .eq("ticket_id", ticketId)
        .select();

    if (error) {
        console.error("Completion Record update error:", error);
        alert("Failed to update Completion Record: " + error.message);
        return;
    }

    if (!data || data.length === 0) {
        alert("No Completion Record was updated. Please check the database permissions.");
        return;
    }

    console.log("Updated Completion Record:", data);

    alert("Completion Record updated successfully!");






    } else {

        // Add new record

        const { data: { session }, error: sessionError } =
            await supabaseClient.auth.getSession();

        if (sessionError || !session) {
            alert("Unable to identify the logged-in employee. Please log in again.");
            return;
        }

        const { error } = await supabaseClient
            .from("work_consent_forms")
            .insert([
                {
                    ticket_id: ticketId,
                    technician_name: technicianName,
                    work_description: workDescription,
                    sender_id: session.user.id
                }
            ]);

        if (error) {
            alert("Failed to save Work Consent Form: " + error.message);
            return;
        }

        alert("Work Consent Form saved successfully!");
    }

    // Close form

    workConsentFormContainer.hidden = true;
    ticketDetailsContainer.hidden = false;

    workConsentForm.reset();

});


// View Work Consent Form
const viewWorkConsentButton = document.getElementById("view-work-consent");

viewWorkConsentButton.addEventListener("click", async function () {

    // Get the actual ticket ID
    const ticketId = document.getElementById("detail-ticket-id").dataset.ticketId;

    if (!ticketId) {
    alert("Ticket ID is missing. Please reopen the ticket.");
    return;
}

    // Retrieve the saved Work Consent Form
    const { data, error } = await supabaseClient
        .from("work_consent_forms")
        .select("*")
        .eq("ticket_id", ticketId)
        .maybeSingle();

    if (error) {
        alert("Failed to load Work Consent Form: " + error.message);
        return;
    }

    if (!data) {
        alert("No Work Consent Form has been created for this ticket yet.");
        return;
    }

    // Retrieve the employee who submitted the form
    let senderName = "Not recorded";

    if (data.sender_id) {
        const { data: profile, error: profileError } = await supabaseClient
            .from("profiles")
            .select("employee_name")
            .eq("id", data.sender_id)
            .maybeSingle();

            console.log("Retrieved profile:", profile);
            console.log("Profile lookup error:", profileError);

    if (profileError) {
        console.error("Failed to retrieve sender name:", profileError);
        senderName = "Unable to load employee name";
    } else if (profile && profile.employee_name) {
        senderName = profile.employee_name;
    }
}

if (data.sender_id) {
    const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("employee_name")
        .eq("id", data.sender_id)
        .maybeSingle();

    if (profileError) {
        console.error("Failed to retrieve sender name:", profileError);
        senderName = "Unable to load employee name";
    } else if (profile && profile.employee_name) {
        senderName = profile.employee_name;
    }
}

    // Display the sender's name
    console.log("Sender ID:", data.sender_id);
    console.log("Sender Name:", senderName);

    const senderRow = document.getElementById("consent-sender-row");

    console.log("Sender row element:", senderRow);
    console.log("Sender row hidden:", senderRow.hidden);
    console.log("Sender row position:", senderRow.getBoundingClientRect());
    console.log("Number of sender rows:", document.querySelectorAll("#consent-sender-row").length);

    console.log("Retrieved Work Consent Form:", data);
    console.log("Saved confirmation time:", data.confirmed_at);

    // Display the saved information
    document.getElementById("consent-ticket-id").textContent =
        document.getElementById("detail-ticket-id").textContent;

    document.getElementById("consent-room").textContent =
        document.getElementById("detail-room").textContent;

    document.getElementById("consent-subject").textContent =
        document.getElementById("detail-subject").textContent;

    document.getElementById("consent-technician-name").value =
        data.technician_name;

    document.getElementById("consent-work-description").value =
        data.work_description;

    const dateTimeRow = document.getElementById("consent-date-time-row");
    const dateTimeText = document.getElementById("consent-date-time");

    dateTimeText.textContent = "";

   dateTimeText.textContent = data.confirmed_at
    ? new Date(data.confirmed_at).toLocaleString("en-GB", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    })
    : "Time not recorded";

    dateTimeRow.hidden = false;

    // Display sender's name
    document.getElementById("consent-sender").textContent = senderName;

    document.getElementById("consent-sender-row").hidden = false;

        setWorkConsentMode("view");

        // Open the form
    ticketDetailsContainer.hidden = true;
    workConsentFormContainer.hidden = false;

   const consentSenderRow = document.getElementById("consent-sender-row");

   document.getElementById("consent-sender").textContent = senderName;

    // Always show sender information in View mode
    document.getElementById("consent-sender-row").hidden = false;

    console.log("Work Consent sender:", senderName);
    console.log("Work Consent sender row hidden:", consentSenderRow.hidden);

    document.getElementById("consent-date-time-row").hidden = false;

});

// Edit Work Consent Form
editWorkConsentButton.addEventListener("click", async function () {

    const ticketId =
        document.getElementById("detail-ticket-id").dataset.ticketId;

    if (!ticketId) {
        alert("Ticket ID is missing. Please reopen the ticket.");
        return;
    }

    // Retrieve existing Work Consent Form

    const { data, error } = await supabaseClient
        .from("work_consent_forms")
        .select("*")
        .eq("ticket_id", ticketId)
        .maybeSingle();

    if (error) {
        alert("Failed to load Work Consent Form: " + error.message);
        return;
    }

    if (!data) {
        alert("No Work Consent Form exists for this ticket.");
        return;
    }

    // Display ticket information

    document.getElementById("consent-ticket-id").textContent =
        document.getElementById("detail-ticket-id").textContent;

    document.getElementById("consent-room").textContent =
        document.getElementById("detail-room").textContent;

    document.getElementById("consent-subject").textContent =
        document.getElementById("detail-subject").textContent;

    // Populate existing information

    document.getElementById("consent-technician-name").value =
        data.technician_name;

    document.getElementById("consent-work-description").value =
        data.work_description;

   

    // Enable Edit mode

    setWorkConsentMode("edit");

    // Open form

    ticketDetailsContainer.hidden = true;
    workConsentFormContainer.hidden = false;

});


// Completion Record Form

const addCompletionRecordButton =
    document.getElementById("add-completion-record");

const viewCompletionRecordButton =
    document.getElementById("view-completion-record");

const completionRecordFormContainer =
    document.getElementById("completion-record-form-container");

const completionRecordForm =
    document.getElementById("completion-record-form");

const cancelCompletionRecordButton =
    document.getElementById("cancel-completion-record");

const closeCompletionRecordButton =
    document.getElementById("close-completion-record");

const editCompletionRecordButton =
    document.getElementById("edit-completion-record");


    let completionRecordMode = "add";


// Control Add and View modes

function setCompletionRecordMode(mode) {

    const technicianInput =
        document.getElementById("completion-technician-name");

    const workPerformedInput =
        document.getElementById("completion-work-performed");

    const completionTimeInput =
        document.getElementById("completion-time");

    const confirmButton =
        completionRecordForm.querySelector('button[type="submit"]');

    const isReadOnly = mode === "view";

    completionRecordMode = mode;

    technicianInput.readOnly = isReadOnly;
    workPerformedInput.readOnly = isReadOnly;

    completionTimeInput.disabled = isReadOnly;

    confirmButton.hidden = isReadOnly;
    cancelCompletionRecordButton.hidden = isReadOnly;

    confirmButton.textContent =
        mode === "edit" ? "Save" : "Confirm";

    document.getElementById("completion-sender-row").hidden = mode !== "view";
    document.getElementById("completion-date-time-row").hidden = mode !== "view";
}


// Add Completion Record Form

addCompletionRecordButton.addEventListener("click", async function () {

    completionRecordForm.reset();

    selectedHour = null;
    selectedMinute = null;

    timePicker.hidden = true;

    document.querySelectorAll("#hour-options button, #minute-options button")
        .forEach(button => button.classList.remove("selected"));

    setCompletionRecordMode("add");

    const ticketId =
        document.getElementById("detail-ticket-id").dataset.ticketId;

    if (!ticketId) {
        alert("Ticket ID is missing. Please reopen the ticket.");
        return;
    }

    // Check whether a Completion Record already exists

    const { data, error } = await supabaseClient
        .from("completion_record_forms")
        .select("ticket_id")
        .eq("ticket_id", ticketId)
        .maybeSingle();

    if (error) {
        alert("Failed to check Completion Record: " + error.message);
        return;
    }

    if (data) {
        alert("A Completion Record already exists for this ticket. Please use View.");
        return;
    }

    // Display ticket information

    document.getElementById("completion-ticket-id").textContent =
        document.getElementById("detail-ticket-id").textContent;

    document.getElementById("completion-room").textContent =
        document.getElementById("detail-room").textContent;

    document.getElementById("completion-subject").textContent =
        document.getElementById("detail-subject").textContent;

    // Hide sender and date/time in Add mode

    document.getElementById("completion-sender-row").hidden = true;

    document.getElementById("completion-date-time-row").hidden = true;

    // Open the form
    ticketDetailsContainer.hidden = true;
    completionRecordFormContainer.hidden = false;

});


// Cancel Completion Record Form

cancelCompletionRecordButton.addEventListener("click", function () {

    completionRecordFormContainer.hidden = true;
    ticketDetailsContainer.hidden = false;

    completionRecordForm.reset();

});


// Close Completion Record Form

closeCompletionRecordButton.addEventListener("click", function () {

    completionRecordFormContainer.hidden = true;
    ticketDetailsContainer.hidden = false;

    completionRecordForm.reset();

});


// Confirm Completion Record Form

// Save or Update Completion Record


completionRecordForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const ticketId =
        document.getElementById("detail-ticket-id").dataset.ticketId;

    const technicianName =
        document.getElementById("completion-technician-name").value.trim();

    const workPerformed =
        document.getElementById("completion-work-performed").value.trim();

    const completionTime =
        document.getElementById("completion-time").value;

    // Get the currently logged-in receptionist

    const { data: { session }, error: sessionError } =
        await supabaseClient.auth.getSession();

    if (sessionError || !session) {
        alert("Unable to identify the logged-in employee. Please log in again.");
        return;
    }

    if (completionRecordMode === "edit") {

        // Update existing Completion Record

        const { data, error } = await supabaseClient
            .from("completion_record_forms")
            .update({
                technician_name: technicianName,
                work_performed: workPerformed,
                completion_time: completionTime,
                sender_id: session.user.id
            })
            .eq("ticket_id", ticketId)
            .select();

        if (error) {
            console.error("Completion Record update error:", error);
            alert("Failed to update Completion Record: " + error.message);
            return;
        }

        if (!data || data.length === 0) {
            alert("No Completion Record was updated. Please check the database permissions.");
            return;
        }

        alert("Completion Record updated successfully!");

    } else {

        // Insert new Completion Record

        const { error } = await supabaseClient
            .from("completion_record_forms")
            .insert([
                {
                    ticket_id: ticketId,
                    technician_name: technicianName,
                    work_performed: workPerformed,
                    completion_time: completionTime,
                    sender_id: session.user.id
                }
            ]);

        if (error) {
            console.error("Completion Record insert error:", error);
            alert("Failed to save Completion Record: " + error.message);
            return;
        }

        alert("Completion Record saved successfully!");
    }

    // Close form

    completionRecordFormContainer.hidden = true;
    ticketDetailsContainer.hidden = false;

    completionRecordForm.reset();

    selectedHour = null;
    selectedMinute = null;

    timePicker.hidden = true;

    document.querySelectorAll("#hour-options button, #minute-options button")
        .forEach(button => button.classList.remove("selected"));

});


// View Completion Record Form

viewCompletionRecordButton.addEventListener("click", async function () {

    console.log("View Completion Record button clicked!");

    const ticketId =
        document.getElementById("detail-ticket-id").dataset.ticketId;

    if (!ticketId) {
        alert("Ticket ID is missing. Please reopen the ticket.");
        return;
    }



    const { data, error } = await supabaseClient
        .from("completion_record_forms")
        .select("*")
        .eq("ticket_id", ticketId)
        .maybeSingle();

        console.log("Current Ticket ID:", ticketId);
        console.log("Retrieved data:", data);
        console.log("Database error:", error);

    if (error) {
        alert("Failed to load Completion Record Form: " + error.message);
        return;
    }

    if (!data) {
        alert("No Completion Record Form has been created for this ticket yet.");
        return;
    }

    // Retrieve the employee who submitted the form

let senderName = "Not recorded";

console.log("Work Consent Form data:", data);
console.log("Work Consent sender ID:", data.sender_id);

if (data.sender_id) {

    const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("employee_name")
        .eq("id", data.sender_id)
        .maybeSingle();

    console.log("Retrieved profile:", profile);
    console.log("Profile lookup error:", profileError);

    if (profileError) {
        senderName = "Unable to load employee name";
    } else if (profile && profile.employee_name) {
        senderName = profile.employee_name;
    }
}

console.log("Final sender name:", senderName);

    // Display ticket information

    document.getElementById("completion-ticket-id").textContent =
        document.getElementById("detail-ticket-id").textContent;

    document.getElementById("completion-room").textContent =
        document.getElementById("detail-room").textContent;

    document.getElementById("completion-subject").textContent =
        document.getElementById("detail-subject").textContent;

    // Display saved information

    document.getElementById("completion-technician-name").value =
        data.technician_name;

    document.getElementById("completion-work-performed").value =
        data.work_performed;

    document.getElementById("completion-time").value =
        data.completion_time;

    // Display automatically recorded date and time

    document.getElementById("completion-date-time").textContent =
    data.recorded_at
        ? new Date(data.recorded_at).toLocaleString("en-GB", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        })
        : "Time not recorded";

    document.getElementById("completion-date-time-row").hidden = false;

    setCompletionRecordMode("view");

    // Open the form
    ticketDetailsContainer.hidden = true;
    completionRecordFormContainer.hidden = false;
    // Display sender's name
   const completionSenderRow = document.getElementById("completion-sender-row");

    document.getElementById("completion-sender").textContent = senderName;

    // Always show sender information in View mode
    document.getElementById("completion-sender-row").hidden = false;

    console.log("Completion Record sender:", senderName);
    console.log("Completion Record sender row hidden:", completionSenderRow.hidden);
    

});

// Edit Completion Record Form

editCompletionRecordButton.addEventListener("click", async function () {

    const ticketId =
        document.getElementById("detail-ticket-id").dataset.ticketId;

    if (!ticketId) {
        alert("Ticket ID is missing. Please reopen the ticket.");
        return;
    }

    // Retrieve existing Completion Record

    const { data, error } = await supabaseClient
        .from("completion_record_forms")
        .select("*")
        .eq("ticket_id", ticketId)
        .maybeSingle();

    if (error) {
        alert("Failed to load Completion Record: " + error.message);
        return;
    }

    if (!data) {
        alert("No Completion Record exists for this ticket.");
        return;
    }

    // Display ticket information

    document.getElementById("completion-ticket-id").textContent =
        document.getElementById("detail-ticket-id").textContent;

    document.getElementById("completion-room").textContent =
        document.getElementById("detail-room").textContent;

    document.getElementById("completion-subject").textContent =
        document.getElementById("detail-subject").textContent;

    // Populate existing information

    document.getElementById("completion-technician-name").value =
        data.technician_name;

    document.getElementById("completion-work-performed").value =
        data.work_performed;

    document.getElementById("completion-time").value =
        data.completion_time.substring(0, 5);

    // Display sender information

    let senderName = "Not recorded";

    if (data.sender_id) {

        const { data: profile, error: profileError } =
            await supabaseClient
                .from("profiles")
                .select("employee_name")
                .eq("id", data.sender_id)
                .maybeSingle();

        if (profileError) {
            senderName = "Unable to load employee name";
        } else if (profile && profile.employee_name) {
            senderName = profile.employee_name;
        }
    }

    

    // Enable Edit mode

    setCompletionRecordMode("edit");

    // Open form

    ticketDetailsContainer.hidden = true;
    completionRecordFormContainer.hidden = false;

});

const completionTimeInput =
    document.getElementById("completion-time");

const timePicker =
    document.getElementById("time-picker");

const hourOptions =
    document.getElementById("hour-options");

const minuteOptions =
    document.getElementById("minute-options");

let selectedHour = null;
let selectedMinute = null;


// Generate hours: 00–23
for (let i = 0; i < 24; i++) {

    const button = document.createElement("button");

    button.type = "button";
    button.textContent = String(i).padStart(2, "0");

    button.addEventListener("click", function () {

        selectedHour = i;

        document.querySelectorAll("#hour-options button").forEach(btn => {
        btn.classList.remove("selected");
        });

        button.classList.add("selected");

        updateTime();

    });

    hourOptions.appendChild(button);
}


/// Generate minutes: 00–59
for (let i = 0; i < 60; i++) {

    const button = document.createElement("button");

    button.type = "button";
    button.textContent = String(i).padStart(2, "0");

    button.addEventListener("click", function () {

        selectedMinute = i;

        document.querySelectorAll("#minute-options button").forEach(btn => {
            btn.classList.remove("selected");
        });

        button.classList.add("selected");

        updateTime();

    });

    minuteOptions.appendChild(button);
}

completionTimeInput.addEventListener("click", function () {

    selectedHour = null;
    selectedMinute = null;

    timePicker.hidden = false;

});


// Update selected time
function updateTime() {

    if (selectedHour !== null && selectedMinute !== null) {

        completionTimeInput.value =
            String(selectedHour).padStart(2, "0") + ":" +
            String(selectedMinute).padStart(2, "0");

        timePicker.hidden = true;

    }

}


// Close picker when clicking outside
document.addEventListener("click", function (event) {

    if (
        !timePicker.contains(event.target) &&
        event.target !== completionTimeInput
    ) {

        timePicker.hidden = true;

    }

});



    


