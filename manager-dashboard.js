const SUPABASE_URL = "https://cfnblxsmgattidymaqjb.supabase.co";
const SUPABASE_KEY = "sb_publishable_zkZUJJa7hj8tWd8tPRxJUA_iJVk_TgG";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
        auth: {
            storageKey: "hotel_manager_auth"
        }
    }
);

// Assignment Window

const assignmentFormContainer =
    document.getElementById("assignment-form-container");

const assignmentForm =
    document.getElementById("assignment-form");

const assignmentSubmitButton =
    assignmentForm.querySelector('button[type="submit"]');

const addAssignmentButton =
    document.getElementById("add-assignment-button");

const editAssignmentButton =
    document.getElementById("edit-assignment-button");

const closeAssignmentFormButton =
    document.getElementById("close-assignment-form");

const cancelAssignmentButton =
    document.getElementById("cancel-assignment");

let currentAssignmentTicketId = null;
let assignmentMode = "add";

// Assignment 24-Hour Time Picker

const assignmentFinishTimeInput =
    document.getElementById("assignment-finish-time");

const assignmentTimePicker =
    document.getElementById("assignment-time-picker");

const assignmentHourOptions =
    document.getElementById("assignment-hour-options");

const assignmentMinuteOptions =
    document.getElementById("assignment-minute-options");

let assignmentSelectedHour = null;
let assignmentSelectedMinute = null;

let assignmentHourPicked = false;
let assignmentMinutePicked = false;


// Generate hours: 00–23

for (let i = 0; i < 24; i++) {

    const button = document.createElement("button");

    button.type = "button";
    button.textContent = String(i).padStart(2, "0");

    button.addEventListener("click", function () {

    assignmentSelectedHour = i;
    assignmentHourPicked = true;

    assignmentHourOptions.querySelectorAll("button").forEach(btn => {
        btn.classList.remove("selected");
    });

    button.classList.add("selected");

    updateAssignmentTime();

});

    assignmentHourOptions.appendChild(button);
}


// Generate minutes: 00–59

for (let i = 0; i < 60; i++) {

    const button = document.createElement("button");

    button.type = "button";
    button.textContent = String(i).padStart(2, "0");

    button.addEventListener("click", function () {

    assignmentSelectedMinute = i;
    assignmentMinutePicked = true;

    assignmentMinuteOptions.querySelectorAll("button").forEach(btn => {
        btn.classList.remove("selected");
    });

    button.classList.add("selected");

    updateAssignmentTime();

});

    assignmentMinuteOptions.appendChild(button);
}


// Open time picker

assignmentFinishTimeInput.addEventListener("click", function () {

    const currentTime = assignmentFinishTimeInput.value;

    if (currentTime) {

        const [hour, minute] = currentTime.split(":").map(Number);

        assignmentSelectedHour = hour;
        assignmentSelectedMinute = minute;

        assignmentHourPicked = true;
        assignmentMinutePicked = true;

    } else {

        assignmentSelectedHour = null;
        assignmentSelectedMinute = null;

        assignmentHourPicked = false;
        assignmentMinutePicked = false;

    }

    assignmentHourOptions.querySelectorAll("button").forEach(btn => {
        btn.classList.toggle(
            "selected",
            Number(btn.textContent) === assignmentSelectedHour
        );
    });

    assignmentMinuteOptions.querySelectorAll("button").forEach(btn => {
        btn.classList.toggle(
            "selected",
            Number(btn.textContent) === assignmentSelectedMinute
        );
    });

    assignmentTimePicker.hidden = false;

});
// Update selected time

function updateAssignmentTime() {

    if (
        assignmentSelectedHour !== null &&
        assignmentSelectedMinute !== null &&
        assignmentHourPicked &&
        assignmentMinutePicked
    ) {

        assignmentFinishTimeInput.value =
            String(assignmentSelectedHour).padStart(2, "0") + ":" +
            String(assignmentSelectedMinute).padStart(2, "0");

        assignmentTimePicker.hidden = true;

    }

}


// Close picker when clicking outside

document.addEventListener("click", function (event) {

    if (
        !assignmentTimePicker.contains(event.target) &&
        event.target !== assignmentFinishTimeInput
    ) {

        assignmentTimePicker.hidden = true;

    }

});


// Open Assign Window

addAssignmentButton.addEventListener("click", function () {

    currentAssignmentTicketId =
        document.getElementById("detail-ticket-id").dataset.ticketId;

    assignmentMode = "add";

    assignmentIsEditMode = false;

    assignmentSubmitButton.textContent = "Confirm";

    assignmentForm.reset();

    document.getElementById("assignment-form-message").textContent = "";

    assignmentFormContainer.hidden = false;
    ticketDetailsContainer.hidden = true;

});


// Open Edit Window

editAssignmentButton.addEventListener("click", async function () {

    currentAssignmentTicketId =
        document.getElementById("detail-ticket-id").dataset.ticketId;

    assignmentMode = "edit";

    assignmentIsEditMode = true;

    assignmentSubmitButton.textContent = "Save";

  

    const { data, error } = await supabaseClient
        .from("maintenance_assignments")
        .select("*")
        .eq("ticket_id", currentAssignmentTicketId)
        .maybeSingle();

    if (error) {
        alert("Failed to load assignment: " + error.message);
        return;
    }

    if (!data) {
        alert("No assignment record exists for this ticket yet.");
        return;
    }

    document.getElementById("assignment-technician").value =
        data.assigned_to;

   document.getElementById("assignment-start").value =
    formatAssignmentDate(data.start_date);

document.getElementById("assignment-end").value =
    formatAssignmentDate(data.end_date);

    document.getElementById("assignment-finish-time").value =
    data.expected_finish_time
        ? data.expected_finish_time.slice(0, 5)
        : "";

    document.getElementById("assignment-form-message").textContent = "";

    assignmentFormContainer.hidden = false;
    ticketDetailsContainer.hidden = true;

});




// Close Assign Window

function closeAssignmentWindow() {

    assignmentFormContainer.hidden = true;
    ticketDetailsContainer.hidden = false;

    assignmentForm.reset();

    assignmentSelectedHour = null;
    assignmentSelectedMinute = null;

    assignmentHourPicked = false;
    assignmentMinutePicked = false;

    assignmentHourOptions.querySelectorAll("button").forEach(btn => {
        btn.classList.remove("selected");
    });

    assignmentMinuteOptions.querySelectorAll("button").forEach(btn => {
        btn.classList.remove("selected");
    });

    assignmentTimePicker.hidden = true;

}

closeAssignmentFormButton.addEventListener(
    "click",
    closeAssignmentWindow
);

cancelAssignmentButton.addEventListener(
    "click",
    closeAssignmentWindow
);


// Save Assignment

assignmentForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const assignedTo =
        document.getElementById("assignment-technician").value.trim();

   const startDateDisplay =
    document.getElementById("assignment-start").value;

const endDateDisplay =
    document.getElementById("assignment-end").value;

// Convert DD/MM/YYYY to YYYY-MM-DD before saving
const startDate = convertDisplayDateToISO(startDateDisplay);
const endDate = convertDisplayDateToISO(endDateDisplay);

    const expectedFinishTime =
        document.getElementById("assignment-finish-time").value;

    const message =
        document.getElementById("assignment-form-message");

    if (!currentAssignmentTicketId) {
        alert("Ticket ID is missing.");
        return;
    }

   if (!startDate || !endDate) {
    alert("Please select valid Start Date and End Date.");
    return;
}

if (endDate < startDate) {
    alert("End Date cannot be earlier than Start Date.");
    return;
}



    message.textContent = "Saving assignment...";


    let result;

    const assignmentData = {
        ticket_id: currentAssignmentTicketId,
        assigned_to: assignedTo,
        start_date: startDate,
        end_date: endDate,
        expected_finish_time: expectedFinishTime
    };

    if (assignmentMode === "add") {

        result = await supabaseClient
            .from("maintenance_assignments")
            .insert([assignmentData]);

    } else {

        result = await supabaseClient
            .from("maintenance_assignments")
            .update(assignmentData)
            .eq("ticket_id", currentAssignmentTicketId);

    }

    if (result.error) {
        console.error("Assignment save error:", result.error);
        message.textContent = "Failed to save assignment.";
        return;
    }

    alert("Assignment saved successfully!");

    assignmentFormContainer.hidden = true;
    ticketDetailsContainer.hidden = false;

    assignmentForm.reset();

    await loadAssignmentDetails(currentAssignmentTicketId);

});

// Format Date to DD/MM/YYYY

function formatAssignmentDate(dateString) {

    if (!dateString) return "";

    const [year, month, day] = dateString.split("-");

    return `${day}/${month}/${year}`;

}


// Load Assignment Details

async function loadAssignmentDetails(ticketId) {

    const { data, error } = await supabaseClient
        .from("maintenance_assignments")
        .select("assigned_to, start_date, end_date, expected_finish_time")
        .eq("ticket_id", ticketId)
        .maybeSingle();

    if (error) {
        console.error("Error loading assignment:", error.message);
    }

    // Display assignment information

    document.getElementById("assignment-assigned-to").textContent =
        data ? data.assigned_to : "Not assigned";

    document.getElementById("assignment-start-date").textContent =
        data && data.start_date
            ? new Date(data.start_date + "T00:00:00").toLocaleDateString("en-GB")
            : "-";

    document.getElementById("assignment-end-date").textContent =
        data && data.end_date
            ? new Date(data.end_date + "T00:00:00").toLocaleDateString("en-GB")
            : "-";

    document.getElementById("assignment-expected-finish-time").textContent =
        data && data.expected_finish_time
            ? data.expected_finish_time.substring(0, 5)
            : "-";

}

/*20-10-2026*/
const logoutButton = document.getElementById("logout-button");

logoutButton.addEventListener("click", function () {
    alert("Logout click detected!");
    window.location.href = "./hotel-manager-login.html";
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
        window.location.replace("hotel-manager-login.html");
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
        viewButton.textContent = "Action";

        viewButton.addEventListener("click", function () {

    // Store the actual UUID for database operations
    document.getElementById("detail-ticket-id").dataset.ticketId = ticket.id;

    // Display the ticket ID
    document.getElementById("detail-ticket-id").textContent = ticket.id;

    // Display ticket information
    document.getElementById("detail-room").textContent = ticket.room_number;
    document.getElementById("detail-subject").textContent = ticket.problem;
    document.getElementById("detail-priority").textContent = ticket.priority;
    document.getElementById("detail-status").textContent = ticket.status;
    
    loadAssignmentDetails(ticket.id);
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
        window.location.replace("hotel-manager-login.html");
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
        profile.role !== "manager" ||
        profile.is_active !== true
    ) {
        await supabaseClient.auth.signOut({ scope: "local" });
        window.location.replace("hotel-manager-login.html");
        return false;
    }

    console.log("Active manager account verified.");
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
const workConsentFormContainer = document.getElementById("work-consent-form-container");
const ticketDetailsContainer = document.getElementById("ticket-details-container");
const cancelWorkConsentButton = document.getElementById("cancel-work-consent");
const workConsentForm = document.getElementById("work-consent-form");

// Control Add and View modes
function setWorkConsentMode(isReadOnly) {

    const technicianInput = document.getElementById("consent-technician-name");
    const descriptionInput = document.getElementById("consent-work-description");

    const confirmButton = workConsentForm.querySelector('button[type="submit"]');

    technicianInput.readOnly = isReadOnly;
    descriptionInput.readOnly = isReadOnly;

    confirmButton.hidden = isReadOnly;
    cancelWorkConsentButton.hidden = isReadOnly;

}


const closeWorkConsentButton = document.getElementById("close-work-consent");

closeWorkConsentButton.addEventListener("click", function () {
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
    
    console.log("Completion Record form data:", data);
    console.log("Completion Record sender ID:", data.sender_id);
    console.log("Retrieved profile:", profile);
    console.log("Profile lookup error:", profileError);

    if (profileError) {
        console.error("Failed to retrieve sender name:", profileError);
        senderName = "Unable to load employee name";
    } else if (profile && profile.employee_name) {
        senderName = profile.employee_name;
    }
}

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

        setWorkConsentMode(true);

        // Open the form
    ticketDetailsContainer.hidden = true;
    workConsentFormContainer.hidden = false;

    document.getElementById("consent-date-time-row").hidden = false;

    // Display sender's name
    document.getElementById("consent-sender").textContent = senderName;
    document.getElementById("consent-sender-row").hidden = false;

});

    // View Completion Record Form

// Completion Record Form


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


// Control Add and View modes

function setCompletionRecordMode(isReadOnly) {

    const technicianInput =
        document.getElementById("completion-technician-name");

    const workPerformedInput =
        document.getElementById("completion-work-performed");

    const completionTimeInput =
        document.getElementById("completion-time");

    const confirmButton =
        completionRecordForm.querySelector('button[type="submit"]');

    technicianInput.readOnly = isReadOnly;
    workPerformedInput.readOnly = isReadOnly;

    completionTimeInput.disabled = isReadOnly;

    confirmButton.hidden = isReadOnly;
    cancelCompletionRecordButton.hidden = isReadOnly;
}


// Close Completion Record Form

closeCompletionRecordButton.addEventListener("click", function () {

    completionRecordFormContainer.hidden = true;
    ticketDetailsContainer.hidden = false;

    completionRecordForm.reset();

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

    if (data.sender_id) {
        const { data: profile, error: profileError } = await supabaseClient
            .from("profiles")
            .select("employee_name")
            .eq("id", data.sender_id)
            .maybeSingle();
    
    console.log("Work Consent form data:", data);
    console.log("Work Consent sender ID:", data.sender_id);
    console.log("Retrieved profile:", profile);
    console.log("Profile lookup error:", profileError);

    if (profileError) {
        console.error("Failed to retrieve sender name:", profileError);
        senderName = "Unable to load employee name";
    } else if (profile && profile.employee_name) {
        senderName = profile.employee_name;
    }
}

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

    setCompletionRecordMode(true);

    // Open the form
    ticketDetailsContainer.hidden = true;
    completionRecordFormContainer.hidden = false;

    // Display sender's name
    document.getElementById("completion-sender").textContent = senderName;
    document.getElementById("completion-sender-row").hidden = false;

    

});

function formatDateDisplay(date) {

    if (!date) return "";

    const [year, month, day] = date.split("-");

    return `${day}/${month}/${year}`;
}

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

        hourOptions.querySelectorAll("button").forEach(btn => {
            btn.classList.remove("selected");
        });

        button.classList.add("selected");

        updateTime();

    });

    hourOptions.appendChild(button);

}


// Generate minutes: 00–59
for (let i = 0; i < 60; i++) {

    const button = document.createElement("button");

    button.type = "button";
    button.textContent = String(i).padStart(2, "0");

    button.addEventListener("click", function () {

        selectedMinute = i;

        minuteOptions.querySelectorAll("button").forEach(btn => {
            btn.classList.remove("selected");
        });

        button.classList.add("selected");

        updateTime();

    });

    minuteOptions.appendChild(button);

}


/// Generate minutes: 00–59
for (let i = 0; i < 60; i++) {

    const button = document.createElement("button");

    button.type = "button";
    button.textContent = String(i).padStart(2, "0");

    button.addEventListener("click", function () {

    assignmentSelectedMinute = i;

    assignmentMinuteOptions.querySelectorAll("button").forEach(btn => {
        btn.classList.remove("selected");
    });

    button.classList.add("selected");

    updateAssignmentTime();

    });

    
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

// Assignment Date Picker

function formatDateDisplay(date) {

    if (!date) return "";

    const [year, month, day] = date.split("-");

    return `${day}/${month}/${year}`;
}


function convertDisplayDateToISO(dateString) {

    const match = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

    if (!match) return null;

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);

    if (year < 2020 || year > 9999) return null;

    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}


function parseDisplayDate(dateString) {

    const isoDate = convertDisplayDateToISO(dateString);

    if (!isoDate) return null;

    const [year, month, day] = isoDate.split("-").map(Number);

    return new Date(year, month - 1, day);
}


function setupAssignmentDatePicker(inputId) {

    const input = document.getElementById(inputId);

    const wrapper = input.closest(".assignment-date-control");

    const calendarButton =
        wrapper.querySelector(".assignment-calendar-button");

    const calendar = document.createElement("div");

    calendar.className = "assignment-calendar";
    calendar.hidden = true;

    calendar.innerHTML = `
        <div class="assignment-calendar-header">

            <button type="button" data-action="previous">
                &#10094;
            </button>

            <select class="assignment-calendar-month"></select>

            <input type="number"
                   class="assignment-calendar-year"
                   min="2020"
                   max="9999">

            <button type="button" data-action="next">
                &#10095;
            </button>

        </div>

        <div class="assignment-calendar-weekdays">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
        </div>

        <div class="assignment-calendar-days"></div>
    `;

    wrapper.appendChild(calendar);

    const monthSelect =
        calendar.querySelector(".assignment-calendar-month");

    const yearInput =
        calendar.querySelector(".assignment-calendar-year");

    const daysContainer =
        calendar.querySelector(".assignment-calendar-days");

    const monthNames = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December"
    ];

    monthSelect.innerHTML = monthNames.map((month, index) =>
        `<option value="${index}">${month}</option>`
    ).join("");

    let viewYear = new Date().getFullYear();
    let viewMonth = new Date().getMonth();


    function renderCalendar() {

        monthSelect.value = viewMonth;
        yearInput.value = viewYear;

        daysContainer.innerHTML = "";

        const firstDay =
            new Date(viewYear, viewMonth, 1).getDay();

        const startingDay = (firstDay + 6) % 7;

        const daysInMonth =
            new Date(viewYear, viewMonth + 1, 0).getDate();

        const selectedDate = parseDisplayDate(input.value);
        const today = new Date();

        // Empty spaces before the first day

        for (let i = 0; i < startingDay; i++) {

            const emptyDay = document.createElement("div");

            daysContainer.appendChild(emptyDay);
        }

        // Create calendar dates

        for (let day = 1; day <= daysInMonth; day++) {

            const dayButton = document.createElement("button");

            dayButton.type = "button";
            dayButton.textContent = day;

            // Highlight today's date
           if (
                !assignmentIsEditMode &&
                today.getFullYear() === viewYear &&
                today.getMonth() === viewMonth &&
                today.getDate() === day
            ) {
        dayButton.classList.add("today");
}

            // Highlight the date already selected in the input
            if (
                selectedDate &&
                selectedDate.getFullYear() === viewYear &&
                selectedDate.getMonth() === viewMonth &&
                selectedDate.getDate() === day
            ) {
                dayButton.classList.add("selected");
            }

            dayButton.addEventListener("click", function () {

                const month = String(viewMonth + 1).padStart(2, "0");

                const formattedDay = String(day).padStart(2, "0");

                input.value =
                    `${formattedDay}/${month}/${viewYear}`;

                input.dispatchEvent(
                    new Event("change", { bubbles: true })
                );

                calendar.hidden = true;

            });

            daysContainer.appendChild(dayButton);
        }
    }


    function openCalendar() {

        const selectedDate = parseDisplayDate(input.value);

        if (selectedDate) {

            viewYear = selectedDate.getFullYear();
            viewMonth = selectedDate.getMonth();

        } else {

            viewYear = Math.max(2020, new Date().getFullYear());
            viewMonth = new Date().getMonth();

        }

        renderCalendar();

        calendar.hidden = false;
    }


    // Previous month

    calendar.querySelector('[data-action="previous"]')
        .addEventListener("click", function () {

            viewMonth--;

            if (viewMonth < 0) {

                viewMonth = 11;
                viewYear--;

            }

            if (viewYear < 2020) {

                viewYear = 2020;
                viewMonth = 0;

            }

            renderCalendar();

        });


    // Next month

    calendar.querySelector('[data-action="next"]')
        .addEventListener("click", function () {

            viewMonth++;

            if (viewMonth > 11) {

                viewMonth = 0;
                viewYear++;

            }

            if (viewYear > 9999) {

                viewYear = 9999;
                viewMonth = 11;

            }

            renderCalendar();

        });


    // Change month

    monthSelect.addEventListener("change", function () {

        viewMonth = Number(this.value);

        renderCalendar();

    });


    // Change year

    yearInput.addEventListener("change", function () {

        const year = Number(this.value);

        if (year < 2020 || year > 9999 || !Number.isInteger(year)) {

            this.value = viewYear;
            return;

        }

        viewYear = year;

        renderCalendar();

    });


    // Open by clicking the date field

    input.addEventListener("click", openCalendar);


    // Open by clicking the calendar icon

    calendarButton.addEventListener("click", openCalendar);


    // Close when clicking outside

    document.addEventListener("click", function (event) {

        if (!wrapper.contains(event.target)) {

            calendar.hidden = true;

        }

    });


    // Close using Escape

    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {

            calendar.hidden = true;

        }

    });

}

let assignmentIsEditMode = false;


// Initialize both date pickers

setupAssignmentDatePicker("assignment-start");

setupAssignmentDatePicker("assignment-end");



    


