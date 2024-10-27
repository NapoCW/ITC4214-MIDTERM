$(document).ready(function () {
    // Load tasks from local storage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Dark mode toggle
    function toggleDarkMode() {
        $('body').toggleClass('dark-mode');
        const modeText = $('body').hasClass('dark-mode') ? 'Light Mode' : 'Dark Mode';
        $('#dark-mode-toggle').text(modeText);
        localStorage.setItem('darkMode', $('body').hasClass('dark-mode'));
    }

    // Load dark mode setting on page load
    if (localStorage.getItem('darkMode') === 'true') {
        $('body').addClass('dark-mode');
        $('#dark-mode-toggle').text('Light Mode');
    }

    // Dark mode button click event
    $('#dark-mode-toggle').click(function () {
        toggleDarkMode();
    });

    // Function to display latest activity on the index page
    function displayLatestActivity() {
        const latestActivityList = $('#latest-activity');
        latestActivityList.empty();

        // Sort tasks by the most recently added
        const sortedTasks = tasks.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));

        // Display the 3 most recent tasks
        for (let i = 0; i < Math.min(3, sortedTasks.length); i++) {
            const task = sortedTasks[i];
            latestActivityList.append(`
                <li class="list-group-item">
                    <strong>Task</strong>: ${task.name} | <strong>Type</strong>: ${task.type} | <strong>Due</strong>: ${task.dueDate} | <strong>Status</strong>: ${task.completion}
                </li>
            `);
        }

        // If no tasks exist
        if (tasks.length === 0) {
            latestActivityList.append('<li class="list-group-item">No recent activity</li>');
        }
    }

    // Call the function to display latest activity if on the index page
    if (window.location.pathname.endsWith('index.html')) {
        displayLatestActivity();
    }

    // Task submission handler for tasks.html
    $('#task-form').on('submit', function (e) {
        e.preventDefault();

        const taskIndex = $('#submit-button').data('index'); // Check if we are editing a task

        // Gather form data
        const taskName = $('#task-name').val();
        const taskType = $('input[name="task-type"]:checked').val();
        const dueDate = $('#due-date').val();
        const taskCompletion = $('#task-completion').val();

        // Create a task object
        const task = {
            name: taskName,
            type: taskType,
            dueDate: dueDate,
            completion: taskCompletion,
            addedDate: new Date().toISOString()
        };

        if (taskIndex !== undefined) {
            // Update existing task
            tasks[taskIndex] = task; 
            $('#submit-button').text('Add Task'); 
            $('#submit-button').removeData('index'); 
        } else {
            // Add a new task
            tasks.push(task);
        }

        // Save tasks to local storage
        localStorage.setItem('tasks', JSON.stringify(tasks));

        // Reset the form
        $('#task-form')[0].reset();

        // Update the task list display
        displayTasks();
    });

    // Function to display tasks in the tasks table
    function displayTasks() {
        const taskList = $('#task-list');
        taskList.empty();

        // Get filter and sort values
        const filterValue = $('#filter-status').val();
        const sortValue = $('#sort-tasks').val();

        // Filter tasks
        let filteredTasks = tasks.filter(task =>
            filterValue === 'All' || task.completion === filterValue
        );

        // Sort tasks
        if (sortValue === 'nearest') {
            filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)); // Nearest due date first
        } else if (sortValue === 'furthest') {
            filteredTasks.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate)); // Furthest due date first
        }

        // Populate the task list
        filteredTasks.forEach((task) => {
            const originalIndex = tasks.indexOf(task); // Find original index in the tasks array

            const completeButton = task.completion === 'Pending'
                ? `<button class="btn btn-success complete-task" data-index="${originalIndex}">Mark Complete</button>`
                : '';

            taskList.append(`
                <tr>
                    <td>${task.name}</td>
                    <td>${task.type}</td>
                    <td>${task.dueDate}</td>
                    <td>${task.completion}</td>
                    <td>
                        <button class="btn btn-warning edit-task" data-index="${originalIndex}">Edit</button>
                        <button class="btn btn-danger delete-task" data-index="${originalIndex}">Delete</button>
                        ${completeButton}
                    </td>
                </tr>
            `);
        });
    }

    // Call displayTasks on page load for tasks.html
    if (window.location.pathname.endsWith('tasks.html')) {
        displayTasks();
    }

    // Filter tasks on change
    $('#filter-status').on('change', displayTasks);

    // Sort tasks on change
    $('#sort-tasks').on('change', displayTasks);

    // Delete task handler
    $(document).on('click', '.delete-task', function () {
        const taskIndex = $(this).data('index');
        tasks.splice(taskIndex, 1);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        displayTasks();
    });

    // Complete task handler
    $(document).on('click', '.complete-task', function () {
        const taskIndex = $(this).data('index');
        tasks[taskIndex].completion = 'Completed';
        localStorage.setItem('tasks', JSON.stringify(tasks));
        displayTasks();
    });

    // Edit task handler
    $(document).on('click', '.edit-task', function () {
        const taskIndex = $(this).data('index');
        const task = tasks[taskIndex];

        // Populate form with task details
        $('#task-name').val(task.name);
        $(`input[name="task-type"][value="${task.type}"]`).prop('checked', true);
        $('#due-date').val(task.dueDate);
        $('#task-completion').val(task.completion);

        // Change submit button to "Update Task"
        $('#submit-button').text('Update Task');
        $('#submit-button').data('index', taskIndex);
    });

    // Contact form submission handler for contact.html
    $('#contact-form').submit(function (event) {
        event.preventDefault(); // Prevent form from refreshing the page

        const name = $('#name').val();
        const email = $('#email').val();
        const subject = $('#subject').val();
        const message = $('#message').val();

        // Display the form details in a pop-up
        alert(`Thank you for contacting us, ${name}!\n\nDetails:\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`);

        // Optionally reset the form after submission
        $('#contact-form')[0].reset();
    });
});