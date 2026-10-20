const SUPABASE_URL = "https://cfnblxsmgattidymaqjb.supabase.co";
const SUPABASE_KEY = "sb_publishable_zkZUJJa7hj8tWd8tPRxJUA_iJVk_TgG";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

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

        ticketList.appendChild(row);
    });
}

/*19-10-2026*/


async function checkLogin() {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error || !data.session) {
        window.location.replace("receptionist-login.html");
        return false;
    }

    console.log("User is logged in.");
    return true;
}




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

