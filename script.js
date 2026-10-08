// ========================================
// SUPABASE
// ========================================

const SUPABASE_URL = "https://vgoezwsinmexomgrlvon.supabase.co";
const SUPABASE_KEY = "sb_publishable_5aSk6Y-_JDLbWFkKSDylfg_8HYahlnC";


NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_5aSk6Y-_JDLbWFkKSDylfg_8HYahlnC

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ========================================
// EVENT DATA
// ========================================

let events = [

    {
        name: "Future Tech Summit",
        category: "Technology",
        date: "2026-11-10",
        time: "10:00 AM",
        venue: "Innovation Hall",
        capacity: 250,
        registered: 184,
        emoji: "💻",
        description:
            "Explore AI, robotics and the technologies shaping tomorrow."
    },

    {
        name: "Soundwave Nights",
        category: "Music",
        date: "2026-11-18",
        time: "7:30 PM",
        venue: "Skyline Arena",
        capacity: 500,
        registered: 362,
        emoji: "🎵",
        description:
            "An unforgettable evening of live music and amazing performances."
    },

    {
        name: "Canvas & Coffee",
        category: "Art",
        date: "2026-11-22",
        time: "4:00 PM",
        venue: "The Art House",
        capacity: 80,
        registered: 52,
        emoji: "🎨",
        description:
            "Paint, create and connect with fellow artists over coffee."
    },

    {
        name: "Startup Connect 2026",
        category: "Business",
        date: "2026-12-02",
        time: "11:00 AM",
        venue: "Business Center",
        capacity: 300,
        registered: 218,
        emoji: "💼",
        description:
            "Meet founders, investors and innovators building the future."
    }

];


// ========================================
// USER DATA
// ========================================

let registrations = [];

let currentUser = null;

let currentCategory = "all";

let selectedEventIndex = null;


// ========================================
// LOGIN MODAL
// ========================================

function openLoginModal() {

    const modal =
        document.getElementById("loginModal");

    if (modal) {
        modal.classList.add("show");
    }

}


function closeLoginModal() {

    const modal =
        document.getElementById("loginModal");

    if (modal) {
        modal.classList.remove("show");
    }

}


function showLoginError(message) {

    const loginError =
        document.getElementById("loginError");

    if (!loginError) return;

    loginError.textContent = message;

    loginError.classList.add("show");

}


function clearLoginError() {

    const loginError =
        document.getElementById("loginError");

    if (!loginError) return;

    loginError.textContent = "";

    loginError.classList.remove("show");

}


// ========================================
// CHECK LOGIN
// ========================================

function requireLogin() {

    if (!currentUser) {

        openLoginModal();

        showLoginError(
            "🔐 Please login first to access EventSphere."
        );

        return false;
    }

    return true;
}


// ========================================
// SUPABASE LOGIN
// ========================================

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(e) {

            e.preventDefault();

            clearLoginError();


            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("loginPassword")
                    .value
                    .trim();


            const selectedRole =
                document.querySelector(
                    'input[name="userRole"]:checked'
                );


            if (!selectedRole) {

                showLoginError(
                    "Please select Host or Participant."
                );

                return;
            }


            if (
                email === "" ||
                password === ""
            ) {

                showLoginError(
                    "Please enter your email and password."
                );

                return;
            }


            const role =
                selectedRole.value;


            const {
                data,
                error
            } =
                await supabaseClient.auth.signInWithPassword({

                    email: email,

                    password: password

                });


            if (error) {

                showLoginError(
                    error.message
                );

                return;
            }


            const user =
                data.user;


            const {
                data: profile,
                error: profileError
            } =
                await supabaseClient
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();


            if (profileError) {

                showLoginError(
                    "User profile not found."
                );

                await supabaseClient.auth.signOut();

                return;
            }


            if (
                profile.role !== role
            ) {

                showLoginError(
                    "Incorrect role selected."
                );

                await supabaseClient.auth.signOut();

                return;
            }


            currentUser = {

                id: user.id,

                username:
                    profile.username,

                role:
                    profile.role,

                email:
                    user.email

            };


            closeLoginModal();

            updateLoginUI();

            displayEvents();

            displayRegisteredEvents();

            updateStats();


            alert(
                `🎉 Welcome ${profile.username}! You are logged in as ${
                    profile.role === "host"
                        ? "Host"
                        : "Participant"
                }.`
            );

        }
    );

}


// ========================================
// LOAD LOGGED-IN USER FROM SUPABASE
// ========================================

async function loadLoggedInUser() {

    const {
        data,
        error
    } =
        await supabaseClient.auth.getUser();


    if (
        error ||
        !data.user
    ) {

        currentUser = null;

        return;
    }


    const user =
        data.user;


    const {
        data: profile,
        error: profileError
    } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();


    if (profileError) {

        currentUser = null;

        await supabaseClient.auth.signOut();

        return;
    }


    currentUser = {

        id: user.id,

        username:
            profile.username,

        role:
            profile.role,

        email:
            user.email

    };

}


// ========================================
// UPDATE LOGIN UI
// ========================================

function updateLoginUI() {

    const loginBtn =
        document.getElementById("loginNavBtn");


    const createBtn =
        document.getElementById("createNavBtn");


    const logoutBtn =
        document.getElementById("logoutBtn");


    const userDisplay =
        document.getElementById("userDisplay");


    if (!currentUser) {

        if (loginBtn) {

            loginBtn.style.display =
                "block";

        }


        if (createBtn) {

            createBtn.style.display =
                "block";

        }


        if (logoutBtn) {

            logoutBtn.style.display =
                "none";

        }


        if (userDisplay) {

            userDisplay.textContent = "";

        }

        return;
    }


    if (loginBtn) {

        loginBtn.style.display =
            "none";

    }


    if (logoutBtn) {

        logoutBtn.style.display =
            "block";

    }


    if (createBtn) {

        createBtn.style.display =
            currentUser.role === "host"
                ? "block"
                : "none";

    }


    if (userDisplay) {

        userDisplay.textContent =
            `${currentUser.username} • ${
                currentUser.role === "host"
                    ? "Host"
                    : "Participant"
            }`;

    }

}


// ========================================
// LOGOUT
// ========================================

async function logout() {

    const {
        error
    } =
        await supabaseClient.auth.signOut();


    if (error) {

        alert(
            "Unable to logout. Please try again."
        );

        return;
    }


    currentUser = null;


    updateLoginUI();

    displayEvents();

    displayRegisteredEvents();


    alert(
        "You have been logged out."
    );


    openLoginModal();

}


// ========================================
// DISPLAY EVENTS
// ========================================

function displayEvents(list = events) {

    const container =
        document.getElementById(
            "eventContainer"
        );


    if (!container) return;


    container.innerHTML = "";


    if (list.length === 0) {

        container.innerHTML = `

            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:50px;
                color:#777;
            ">

                <h3>No events found</h3>

                <p>
                    Try another search.
                </p>

            </div>

        `;

        return;
    }


    list.forEach(event => {

        const card =
            document.createElement("div");


        card.className =
            "event-card";


        const registered =
            isRegistered(event);


        card.innerHTML = `

            <div class="event-image ${event.category.toLowerCase()}">

                ${event.emoji}

            </div>


            <div class="event-info">

                <span class="event-category">

                    ${event.category}

                </span>


                <h3>

                    ${event.name}

                </h3>


                <p class="event-description">

                    ${event.description}

                </p>


                <div class="event-meta">

                    <span>
                        📅 ${formatDate(event.date)}
                    </span>


                    <span>
                        👥 ${event.registered}/${event.capacity}
                    </span>

                </div>


                <button
                    class="register-btn ${registered ? "registered" : ""}"
                    ${registered ? "disabled" : ""}
                    data-event-name="${event.name}"
                >

                    ${
                        registered
                            ? "✓ You're Registered"
                            : "Reserve Your Spot →"
                    }

                </button>

            </div>

        `;


        const registerButton =
            card.querySelector(".register-btn");


        if (!registered) {

            registerButton.addEventListener(
                "click",
                function() {

                    openRegisterByName(
                        event.name
                    );

                }
            );

        }


        container.appendChild(card);

    });


    updateStats();

}


// ========================================
// OPEN REGISTER USING EVENT NAME
// ========================================

function openRegisterByName(eventName) {

    if (!requireLogin()) {
        return;
    }


    if (
        currentUser.role !== "participant"
    ) {

        alert(
            "Only Participants can register for events."
        );

        return;
    }


    const index =
        events.findIndex(
            event =>
                event.name === eventName
        );


    if (index === -1) return;


    selectedEventIndex =
        index;


    const event =
        events[index];


    document
        .getElementById(
            "registerEventName"
        )
        .textContent =
        event.name;


    document
        .getElementById(
            "registerModal"
        )
        .classList.add("show");

}


// ========================================
// DATE FORMAT
// ========================================

function formatDate(date) {

    const d =
        new Date(date);


    return d.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );

}


// ========================================
// SEARCH
// ========================================

function searchEvents() {

    const input =
        document.getElementById(
            "searchInput"
        );


    if (!input) return;


    const search =
        input.value
            .toLowerCase()
            .trim();


    const filtered =
        events.filter(event => {

            const matchesSearch =

                event.name
                    .toLowerCase()
                    .includes(search)

                ||

                event.category
                    .toLowerCase()
                    .includes(search)

                ||

                event.venue
                    .toLowerCase()
                    .includes(search);


            const matchesCategory =

                currentCategory === "all"

                ||

                event.category ===
                currentCategory;


            return (
                matchesSearch &&
                matchesCategory
            );

        });


    displayEvents(filtered);

}


// ========================================
// FILTER EVENTS
// ========================================

function filterEvents(
    category,
    button
) {

    if (!requireLogin()) {
        return;
    }


    currentCategory =
        category;


    document
        .querySelectorAll(".category")
        .forEach(btn => {

            btn.classList.remove(
                "active"
            );

        });


    if (button) {

        button.classList.add(
            "active"
        );

    }


    searchEvents();

}


// ========================================
// CREATE EVENT MODAL
// ========================================

function openCreateForm() {

    if (!requireLogin()) {
        return;
    }


    if (
        currentUser.role !== "host"
    ) {

        alert(
            "🚫 Only the Host can create events."
        );

        return;
    }


    document
        .getElementById("eventModal")
        .classList.add("show");

}


function closeModal() {

    const modal =
        document.getElementById(
            "eventModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


// ========================================
// CREATE EVENT
// ========================================

const eventForm =
    document.getElementById(
        "eventForm"
    );


if (eventForm) {

    eventForm.addEventListener(
        "submit",
        function(e) {

            e.preventDefault();


            if (!requireLogin()) {
                return;
            }


            if (
                currentUser.role !== "host"
            ) {

                alert(
                    "Only the Host can create events."
                );

                return;
            }


            const category =
                document
                    .getElementById(
                        "eventCategory"
                    )
                    .value;


            const newEvent = {

                name:
                    document
                        .getElementById(
                            "eventName"
                        )
                        .value
                        .trim(),

                category:
                    category,

                date:
                    document
                        .getElementById(
                            "eventDate"
                        )
                        .value,

                time:
                    document
                        .getElementById(
                            "eventTime"
                        )
                        .value,

                venue:
                    document
                        .getElementById(
                            "eventVenue"
                        )
                        .value
                        .trim(),

                capacity:
                    Number(
                        document
                            .getElementById(
                                "eventCapacity"
                            )
                            .value
                    ),

                registered: 0,

                emoji:
                    getEmoji(category),

                description:
                    document
                        .getElementById(
                            "eventDescription"
                        )
                        .value
                        .trim()

            };


            events.unshift(
                newEvent
            );


            displayEvents();


            eventForm.reset();


            closeModal();


            alert(
                "🎉 Your event has been published!"
            );


            document
                .getElementById(
                    "events"
                )
                .scrollIntoView({
                    behavior: "smooth"
                });

        }
    );

}


// ========================================
// EVENT EMOJI
// ========================================

function getEmoji(category) {

    const emojis = {

        Technology: "💻",

        Music: "🎵",

        Art: "🎨",

        Business: "💼"

    };


    return (
        emojis[category] ||
        "✨"
    );

}


// ========================================
// REGISTRATION MODAL
// ========================================

function openRegister(index) {

    if (!requireLogin()) {
        return;
    }


    if (
        currentUser.role !== "participant"
    ) {

        alert(
            "Only Participants can register for events."
        );

        return;
    }


    selectedEventIndex =
        index;


    const event =
        events[index];


    document
        .getElementById(
            "registerEventName"
        )
        .textContent =
        event.name;


    document
        .getElementById(
            "registerModal"
        )
        .classList.add("show");

}


function closeRegisterModal() {

    const modal =
        document.getElementById(
            "registerModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


// ========================================
// REGISTRATION FORM
// ========================================

const registerForm =
    document.getElementById(
        "registerForm"
    );


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        function(e) {

            e.preventDefault();


            if (!requireLogin()) {
                return;
            }


            if (
                currentUser.role !==
                "participant"
            ) {

                alert(
                    "Only Participants can register."
                );

                return;
            }


            const name =
                document
                    .getElementById(
                        "userName"
                    )
                    .value
                    .trim();


            const email =
                document
                    .getElementById(
                        "userEmail"
                    )
                    .value
                    .trim();


            const event =
                events[
                    selectedEventIndex
                ];


            if (!event) {
                return;
            }


            if (
                event.registered >=
                event.capacity
            ) {

                alert(
                    "Sorry! This event is fully booked."
                );

                return;
            }


            const duplicate =
                registrations.some(
                    registration =>

                        registration.email
                            .toLowerCase() ===
                        email.toLowerCase()

                        &&

                        registration.event ===
                        event.name
                );


            if (duplicate) {

                alert(
                    "You are already registered for this event."
                );

                return;
            }


            registrations.push({

                name:
                    name,

                email:
                    email,

                event:
                    event.name

            });


            event.registered++;


            closeRegisterModal();


            registerForm.reset();


            displayEvents();

            displayRegisteredEvents();

            updateStats();


            alert(
                `🎉 You're registered for ${event.name}!`
            );


            document
                .getElementById(
                    "manage"
                )
                .scrollIntoView({
                    behavior: "smooth"
                });

        }
    );

}


// ========================================
// CHECK IF REGISTERED
// ========================================

function isRegistered(event) {

    return registrations.some(

        registration =>
            registration.event ===
            event.name

    );

}


// ========================================
// UPDATE DASHBOARD STATS
// ========================================

function updateStats() {

    const eventCount =
        document.getElementById(
            "eventCount"
        );


    const attendeeCount =
        document.getElementById(
            "attendeeCount"
        );


    if (eventCount) {

        eventCount.textContent =
            events.length;

    }


    const totalAttendees =
        events.reduce(
            (total, event) =>
                total +
                event.registered,
            0
        );


    if (attendeeCount) {

        attendeeCount.textContent =
            totalAttendees;

    }

}


// ========================================
// MANAGE EVENTS
// ========================================

function displayRegisteredEvents() {

    const container =
        document.getElementById(
            "registeredEventsContainer"
        );


    if (!container) return;


    if (
        registrations.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-events">

                <span>🎟️</span>

                <h3>
                    No registered events yet
                </h3>

                <p>
                    Register for an event and it will appear here.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML = "";


    registrations.forEach(
        registration => {

            const event =
                events.find(
                    item =>
                        item.name ===
                        registration.event
                );


            if (!event) return;


            const status =
                getEventStatus(
                    event
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "registered-event-card";


            card.innerHTML = `

                <div class="registered-event-icon">

                    ${event.emoji}

                </div>


                <div class="registered-event-info">

                    <h3>

                        ${event.name}

                    </h3>


                    <p class="registered-user">

                        Registered by:
                        ${registration.name}

                    </p>


                    <div class="registered-event-meta">

                        <span>
                            📅 ${formatDate(event.date)}
                        </span>

                        <span>
                            🕐 ${event.time}
                        </span>

                        <span>
                            📍 ${event.venue}
                        </span>

                    </div>

                </div>


                <div
                    class="event-status ${status.className}"
                >

                    ${status.text}

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}


// ========================================
// EVENT STATUS
// ========================================

function getEventStatus(event) {

    const eventDate =
        new Date(
            `${event.date}T${convertTo24Hour(event.time)}`
        );


    const now =
        new Date();


    const endDate =
        new Date(
            eventDate.getTime() +
            (2 * 60 * 60 * 1000)
        );


    if (
        now < eventDate
    ) {

        return {

            text: "Upcoming",

            className:
                "status-upcoming"

        };

    }


    if (
        now >= eventDate &&
        now < endDate
    ) {

        return {

            text: "Ongoing",

            className:
                "status-ongoing"

        };

    }


    return {

        text: "Completed",

        className:
            "status-completed"

    };

}


// ========================================
// CONVERT TIME
// ========================================

function convertTo24Hour(time) {

    if (
        time &&
        !time.includes(" ")
    ) {

        return time;

    }


    const parts =
        time.split(" ");


    const timePart =
        parts[0];


    const modifier =
        parts[1];


    let [hours, minutes] =
        timePart.split(":");


    if (
        modifier === "PM" &&
        hours !== "12"
    ) {

        hours =
            Number(hours) + 12;

    }


    if (
        modifier === "AM" &&
        hours === "12"
    ) {

        hours = "00";

    }


    return `${String(hours).padStart(2, "0")}:${minutes}`;

}


// ========================================
// PROTECT NAVIGATION
// ========================================

document
    .querySelectorAll("nav a")
    .forEach(link => {

        link.addEventListener(
            "click",
            function(e) {

                if (!currentUser) {

                    e.preventDefault();

                    openLoginModal();

                    showLoginError(
                        "🔐 Please login first to access EventSphere."
                    );

                }

            }
        );

    });


// ========================================
// PROTECT SEARCH
// ========================================

const searchInput =
    document.getElementById(
        "searchInput"
    );


if (searchInput) {

    searchInput.addEventListener(
        "focus",
        function() {

            if (!currentUser) {

                searchInput.blur();

                openLoginModal();

                showLoginError(
                    "🔐 Please login first to explore events."
                );

            }

        }
    );

}


// ========================================
// CLOSE MODALS WHEN CLICKING OUTSIDE
// ========================================

window.addEventListener(
    "click",
    function(e) {

        const eventModal =
            document.getElementById(
                "eventModal"
            );


        const registerModal =
            document.getElementById(
                "registerModal"
            );


        const loginModal =
            document.getElementById(
                "loginModal"
            );


        if (
            eventModal &&
            e.target === eventModal
        ) {

            closeModal();

        }


        if (
            registerModal &&
            e.target === registerModal
        ) {

            closeRegisterModal();

        }


        if (
            loginModal &&
            e.target === loginModal &&
            !currentUser
        ) {

            showLoginError(
                "🔐 Please login first to continue."
            );

        }

    }
);


// ========================================
// PREVENT ESCAPE FROM LOGIN
// ========================================

document.addEventListener(
    "keydown",
    function(e) {

        if (
            e.key === "Escape" &&
            !currentUser
        ) {

            const loginModal =
                document.getElementById(
                    "loginModal"
                );


            if (loginModal) {

                e.preventDefault();

            }

        }

    }
);


// ========================================
// INITIALIZE APP
// ========================================

async function initializeApp() {

    await loadLoggedInUser();

    updateLoginUI();

    displayEvents();

    displayRegisteredEvents();

    updateStats();


    if (!currentUser) {

        setTimeout(
            function() {

                openLoginModal();

            },
            300
        );

    }

}


initializeApp();
