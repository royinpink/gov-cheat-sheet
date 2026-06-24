// ── Event-name search box ──────────────────────────────────────────
import { getAllEventNames, eventMatchesName,
         setActiveTitleFilter } from "./filters.js";
import { renderView } from "./ui.js";

export function buildTitleSearchRow(bar) {
  var row = document.createElement("div");
  row.className = "title-search-row";
  var lbl = document.createElement("label");
  lbl.className = "filter-label";
  lbl.textContent = "Find event:";
  lbl.setAttribute("for", "title-input");
  row.appendChild(lbl);

  var wrap = document.createElement("div");
  wrap.className = "title-search-wrap";

  var input = document.createElement("input");
  input.type = "text";
  input.id = "title-input";
  input.className = "title-search-input";
  input.placeholder = "Type or select an event...";
  input.autocomplete = "off";

  var clearBtn = document.createElement("button");
  clearBtn.className = "title-clear";
  clearBtn.id = "title-clear-btn";
  clearBtn.innerHTML = "&#x2715;";
  clearBtn.setAttribute("aria-label", "Clear event filter");
  clearBtn.setAttribute("type", "button");
  clearBtn.style.display = "none";
  clearBtn.onclick = function () {
    clearTitleFilter();
  };

  var dropdown = document.createElement("div");
  dropdown.id = "title-dropdown";
  dropdown.className = "title-dropdown";
  dropdown.style.display = "none";

  input.addEventListener("input", function () {
    onTitleInput();
  });
  input.addEventListener("focus", function () {
    onTitleInput(true);
  });
  input.addEventListener("keydown", function (e) {
    var opts = dropdown.querySelectorAll(".title-option");
    var hi = dropdown.querySelector(".highlighted");
    var idx = hi ? Array.from(opts).indexOf(hi) : -1;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      var n = opts[idx + 1] || opts[0];
      if (n) {
        if (hi) hi.classList.remove("highlighted");
        n.classList.add("highlighted");
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      var p = opts[idx - 1] || opts[opts.length - 1];
      if (p) {
        if (hi) hi.classList.remove("highlighted");
        p.classList.add("highlighted");
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      var h = dropdown.querySelector(".highlighted");
      if (h) setTitleFilter(h.dataset.title, input);
    } else if (e.key === "Escape") {
      dropdown.style.display = "none";
    }
  });

  document.addEventListener("click", function (e) {
    if (!wrap.contains(e.target)) dropdown.style.display = "none";
  });

  wrap.appendChild(input);
  wrap.appendChild(clearBtn);
  wrap.appendChild(dropdown);

  row.appendChild(wrap);
  bar.appendChild(row);
}

export function onTitleInput(showAll) {
  var input = document.getElementById("title-input");
  var dropdown = document.getElementById("title-dropdown");
  var q = (input.value || "").toLowerCase().trim();
  var all = getAllEventNames();
  var filtered =
    showAll && !q
      ? all
      : all.filter(function (t) {
          return t.toLowerCase().indexOf(q) >= 0;
        });
  if (!filtered.length) {
    dropdown.style.display = "none";
    return;
  }
  dropdown.innerHTML = filtered
    .map(function (t) {
      return (
        '<div class="title-option" data-title="' +
        t.replace(/"/g, "&quot;") +
        '">' +
        t +
        "</div>"
      );
    })
    .join("");
  dropdown.querySelectorAll(".title-option").forEach(function (opt) {
    opt.addEventListener("mousedown", function (e) {
      e.preventDefault();
      setTitleFilter(opt.dataset.title, input);
    });
  });
  dropdown.style.display = "block";
}

/** Activates the event-name search filter and re-renders. */
export function setTitleFilter(title, input) {
  setActiveTitleFilter(title);
  if (input) input.value = title;
  var dropdown = document.getElementById("title-dropdown");
  if (dropdown) dropdown.style.display = "none";
  var clearBtn = document.getElementById("title-clear-btn");
  if (clearBtn) clearBtn.style.display = "block";

  renderView();
}

/** Clears the event-name search filter and re-renders. */
export function clearTitleFilter() {
  setActiveTitleFilter(null);
  var input = document.getElementById("title-input");
  if (input) input.value = "";
  var clearBtn = document.getElementById("title-clear-btn");
  if (clearBtn) clearBtn.style.display = "none";

  var dropdown = document.getElementById("title-dropdown");
  if (dropdown) dropdown.style.display = "none";
  renderView();
}

