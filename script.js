function toggleDropdown() {
    document.getElementById("color-dropdown").classList.toggle("show");
    document.getElementById("color-menu").classList.toggle("highlight");
}

window.onclick = function(event) {
    if (!event.target.matches('#color-menu')) {
        var dropdown = document.getElementById("color-dropdown");
        var colormenu = document.getElementById("color-menu")
        if (dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
            colormenu.classList.remove('highlight')
        }
    }
}

function updateFavicon() {
    const rootStyles = getComputedStyle(document.documentElement);
    const accentColor = rootStyles.getPropertyValue('--accent-color').trim();

    const svgCode = `
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 640'>
        <path fill='${encodeURIComponent(accentColor)}' d="M392.8 65.2C375.8 60.3 358.1 70.2 353.2 87.2L225.2 535.2C220.3 552.2 230.2 569.9 247.2 574.8C264.2 579.7 281.9 569.8 286.8 552.8L414.8 104.8C419.7 87.8 409.8 70.1 392.8 65.2zM457.4 201.3C444.9 213.8 444.9 234.1 457.4 246.6L530.8 320L457.4 393.4C444.9 405.9 444.9 426.2 457.4 438.7C469.9 451.2 490.2 451.2 502.7 438.7L598.7 342.7C611.2 330.2 611.2 309.9 598.7 297.4L502.7 201.4C490.2 188.9 469.9 188.9 457.4 201.4zM182.7 201.3C170.2 188.8 149.9 188.8 137.4 201.3L41.4 297.3C28.9 309.8 28.9 330.1 41.4 342.6L137.4 438.6C149.9 451.1 170.2 451.1 182.7 438.6C195.2 426.1 195.2 405.8 182.7 393.3L109.3 320L182.6 246.6C195.1 234.1 195.1 213.8 182.6 201.3z" />
      </svg>
    `;

    const favicon = document.getElementById('dynamic-favicon');
    if (favicon) {
        favicon.href = `data:image/svg+xml;utf8,${svgCode}`;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const savedColor = localStorage.getItem('user-accent-color');
    if (savedColor) {
        document.documentElement.style.setProperty('--accent-color', savedColor);
    }
    updateFavicon();

    const savedTheme = localStorage.getItem('user-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
        document.body.classList.add('light');
    } else {
        document.body.classList.remove('light');
    }

    const colorButtons = document.querySelectorAll('.color-switch');
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetColor = button.getAttribute('data-color');
            document.documentElement.style.setProperty('--accent-color', targetColor);
            localStorage.setItem('user-accent-color', targetColor);
            updateFavicon();
        });
    });

    const themeBtn = document.getElementById('mode-switch');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('light');

            if (document.body.classList.contains('light')) {
                localStorage.setItem('user-theme', 'light');
            } else {
                localStorage.setItem('user-theme', 'dark');
            }
        });
    }
});

document.addEventListener('click', async (event) => {
  const link = event.target.closest('.nav-link');
  
  if (link) {
    event.preventDefault();
    
    const url = link.getAttribute('href');
    
    history.pushState(null, '', url);
    
    await updateContent(url);
  }
});

async function updateContent(url) {
  try {
    const response = await fetch(url);
    const htmlText = await response.text();
    const parser = new DOMParser();
    const newSite = parser.parseFromString(htmlText, 'text/html');
    
    const newMain = newSite.querySelector('.main').innerHTML;
    document.querySelector('.main').innerHTML = newMain;

    const SidebarInfo = newSite.querySelector('#sidebar-info').innerHTML;
    document.querySelector('#sidebar-info').innerHTML = SidebarInfo;

    if (typeof loadNotes === "function") {
      loadNotes();
      loadProjects();
      loadNotesMain();
    }
    
  } catch (error) {
    console.error('Error loading page: ', error);
    window.location.href = url;
  }
}

window.addEventListener('popstate', () => {
  updateContent(window.location.pathname);
});

function loadNotesMain() {
  const container = document.getElementById("notes-container");

  fetch("/home/notes/content.json")
    .then(response => response.json())
    .then(notes => {
      container.innerHTML = "";

      if (notes && notes.length > 0) {
        const latestNotes = notes.slice(0, 5);

        latestNotes.forEach(note => {
          const noteItem = document.createElement("div");
          noteItem.classList.add("note-item");

          const dateField = document.createElement("span");
          dateField.classList.add("note-date");
          
          dateField.textContent = note.date;

          const linkElement = document.createElement("a");
          linkElement.href = note.url;
          linkElement.textContent = note.title;
          linkElement.classList.add("note-link");
          linkElement.classList.add("link");

          noteItem.appendChild(dateField);
          noteItem.appendChild(linkElement);

          container.appendChild(noteItem);
        });
      } else {
        container.innerHTML = "<p>No Notes loaded</p>";
      }
    })
    .catch(error => {
      console.error("Error loading Notes: ", error);
    });
};

document.addEventListener("DOMContentLoaded", () => {
  loadNotes();
  loadProjects();
  loadNotesMain();
});

function loadNotes() {
  const container = document.getElementById("notes-container-full");

  fetch("/home/notes/content.json")
    .then(response => response.json())
    .then(notes => {
      container.innerHTML = "";

      if (notes && notes.length > 0) {
        const latestNotes = notes;

        latestNotes.forEach(note => {
          const noteItem = document.createElement("div");
          noteItem.classList.add("note-item");

          const dateField = document.createElement("span");
          dateField.classList.add("note-date");
          
          dateField.textContent = note.date;

          const linkElement = document.createElement("a");
          linkElement.href = note.url;
          linkElement.textContent = note.title;
          linkElement.classList.add("note-link");
          linkElement.classList.add("link");

          noteItem.appendChild(dateField);
          noteItem.appendChild(linkElement);

          container.appendChild(noteItem);
        });
      } else {
        container.innerHTML = "<p>No Notes loaded</p>";
      }
    })
    .catch(error => {
      console.error("Error loading Notes: ", error);
    });
};

function loadProjects() {
  const container = document.getElementById("projects-container-full");

  fetch("/home/projects/content.json")
    .then(response => response.json())
    .then(projects => {
      container.innerHTML = "";

      if (projects && projects.length > 0) {
        const latestProjects = projects;

        latestProjects.forEach(project => {
          const projectItem = document.createElement("div");
          projectItem.classList.add("project-item");

          const dateField = document.createElement("span");
          dateField.classList.add("project-date");
          
          dateField.textContent = project.date;

          const linkElement = document.createElement("a");
          linkElement.href = project.url;
          linkElement.textContent = project.title;
          linkElement.classList.add("project-link");
          linkElement.classList.add("link");

          projectItem.appendChild(dateField);
          projectItem.appendChild(linkElement);

          container.appendChild(projectItem);
        });
      } else {
        container.innerHTML = "<p>No Projects loaded</p>";
      }
    })
    .catch(error => {
      console.error("Error loading Projects: ", error);
    });
};

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const sidebar = document.querySelector(".sidebar");
  
  const navLinks = sidebar.querySelectorAll(".nav-link");

  const closeMenu = () => {
    sidebar.classList.remove("is-active");
    if (menuToggle) {
      menuToggle.textContent = "☰";
    }
  };
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("is-active");
      
      if (sidebar.classList.contains("is-active")) {
        menuToggle.textContent = "✕";
      } else {
        menuToggle.textContent = "☰";
      }
    });
  }
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });
});
