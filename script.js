/**
 * GENIO ENGINE v4 — Firebase Compat (no CORS issues with file://)
 */

// Firebase Init
firebase.initializeApp({
    apiKey: "AIzaSyBaFwpFRPm6ILxqnVw_JzK7HaLB5wiIHCk",
    authDomain: "genio-2289b.firebaseapp.com",
    projectId: "genio-2289b",
    storageBucket: "genio-2289b.firebasestorage.app",
    messagingSenderId: "276959059837",
    appId: "1:276959059837:web:93c8ebb1960efb029a7614",
    measurementId: "G-KT8NY00S1N"
});

var auth = firebase.auth();
var db = firebase.firestore();
var IMGBB_KEY = "c78ac879862ec7a6dfa0879783a642f8";

/* ============================================
   1. SEGMENTATION POPUP
   ============================================ */
function showSegmentPopup() {
    if (sessionStorage.getItem('genio_segment')) return;
    var popup = document.getElementById('segment-popup');
    if (!popup) return;
    setTimeout(function() {
        popup.style.display = 'flex';
    }, 1200);
}

function closeSegment(target) {
    var popup = document.getElementById('segment-popup');
    if (popup) popup.style.display = 'none';
    sessionStorage.setItem('genio_segment', 'done');
    var el = document.querySelector(target);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

/* ============================================
   2. NAVBAR SCROLL
   ============================================ */
function initNavbar() {
    var nav = document.getElementById('navbar');
    if (!nav) return;
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }, { passive: true });
}

/* ============================================
   3. SCROLL REVEAL
   ============================================ */
function initScrollReveal() {
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-up, .fade-in').forEach(function(el) {
        observer.observe(el);
    });
}

/* ============================================
   4. DYNAMIC NEWS (Firebase → Homepage)
   ============================================ */
function loadNews() {
    var container = document.getElementById('news-row');
    if (!container) return;

    db.collection("news").orderBy("timestamp", "desc").limit(3).get()
        .then(function(snap) {
            if (!snap.empty) {
                container.innerHTML = '';
                snap.forEach(function(doc) {
                    var d = doc.data();
                    var dateStr = 'RÉCENT';
                    if (d.timestamp && d.timestamp.toDate) {
                        dateStr = new Date(d.timestamp.toDate()).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).toUpperCase();
                    }
                    container.innerHTML += '<article class="news-item"><div class="news-border"></div><div class="news-inner"><span class="news-badge">// ' + (d.category || 'INSIGHT') + '</span><div class="news-date">' + dateStr + '</div><h3>' + d.title + '</h3><a href="news.html?id=' + doc.id + '" class="news-more">DÉCOUVRIR →</a></div></article>';
                });
            }
            // If empty, keep the static fallback already in HTML
        })
        .catch(function(e) {
            console.log("Firebase news: using static fallback", e.message);
        });
}

/* ============================================
   5. DYNAMIC EVENTS (Firebase → events.html)
   ============================================ */
function loadEvents() {
    var grid = document.getElementById('events-grid');
    if (!grid) return;

    db.collection("events").orderBy("date", "asc").get()
        .then(function(snap) {
            if (!snap.empty) {
                grid.innerHTML = '';
                var targetRegisterId = new URLSearchParams(window.location.search).get('register');

                snap.forEach(function(doc) {
                    var d = doc.data();
                    if (d.status === 'CLOSED') return; // Hide closed events from the public site
                    
                    var isTraining = d.type === 'FORMATION';
                    var imageUrl = d.image || 'https://via.placeholder.com/600x400/00caff/ffffff?text=Genio+Event';
                    var escapedTitle = d.title.replace(/'/g, "\\'");
                    
                    grid.innerHTML += '<div class="event-card fade-up ' + (isTraining ? 'training-highlight' : '') + '">' +
                        '<div class="event-image" style="background-image: url(\'' + imageUrl + '\'); height: 200px; background-size: cover; background-position: center; border-radius: 4px 4px 0 0;"></div>' +
                        '<div class="event-content" style="padding: 1.5rem; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); border-top: none; border-radius: 0 0 4px 4px;">' +
                            '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">' +
                                '<div class="event-badge" style="background: ' + (isTraining ? 'var(--orange-action)' : 'var(--blue-tech)') + '; color: #fff; padding: 0.2rem 0.8rem; border-radius: 20px; font-size: 0.7rem; font-weight: 700; font-family: var(--font-mono);">' + d.type + '</div>' +
                                '<div class="event-date-display" style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted);">' + (d.date_label || 'À VENIR') + '</div>' +
                            '</div>' +
                            '<h3 style="font-size: 1.2rem; margin-bottom: 0.5rem; color: #fff;">' + d.title + '</h3>' +
                            '<div style="font-family: var(--font-mono); font-size: 0.8rem; color: ' + (isTraining ? 'var(--orange-action)' : 'var(--blue-tech)') + '; margin-bottom: 1rem;">' + (d.price || 'Gratuit') + ' • ' + (d.capacity ? (d.capacity + ' Places') : 'Places limitées') + '</div>' +
                            '<p style="color: rgba(255, 255, 255, 0.7); font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">' + d.description + '</p>' +
                            '<button onclick="openRegisterModal(\'' + doc.id + '\',\'' + escapedTitle + '\')" class="btn-primary" style="width: 100%;">RÉSERVER MA PLACE</button>' +
                        '</div>' +
                    '</div>';

                    // Auto-open modal if the user came from a share link
                    if (targetRegisterId === doc.id) {
                        setTimeout(function() {
                            openRegisterModal(doc.id, d.title);
                            var el = document.getElementById('register-modal');
                            if(el) el.scrollIntoView({ behavior: 'smooth' });
                        }, 800);
                    }
                });
            }
        })
        .catch(function(e) {
            console.log("Firebase events: using static fallback", e.message);
        });
}

/* ============================================
   6. ADMIN DASHBOARD
   ============================================ */
function initAdmin() {
    if (!window.location.pathname.includes('admin')) return;

    // Tab switching
    document.querySelectorAll('.nav-item[data-tab]').forEach(function(item) {
        item.addEventListener('click', function() {
            document.querySelectorAll('.nav-item').forEach(function(i) { i.classList.remove('active'); });
            item.classList.add('active');
            document.querySelectorAll('.admin-tab').forEach(function(t) { t.classList.remove('active'); });
            var tab = document.getElementById(item.dataset.tab);
            if (tab) tab.classList.add('active');
        });
    });

    // Load leads & admin events
    loadLeads();
    if(window.location.pathname.includes('admin')) {
        loadAdminEventsList();
    }

    // News form
    var newsForm = document.getElementById('form-add-news');
    if (newsForm) {
        newsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var btn = newsForm.querySelector('button[type="submit"]');
            btn.textContent = "PUBLICATION...";
            btn.disabled = true;

            var fileInput = document.getElementById('news-img-file');
            var uploadPromise = (fileInput && fileInput.files[0]) ? uploadToImgBB(fileInput.files[0]) : Promise.resolve('');
            
            uploadPromise.then(function(imageUrl) {
                return db.collection("news").add({
                    title: newsForm.querySelector('input[type="text"]').value,
                    excerpt: newsForm.querySelector('textarea').value,
                    category: newsForm.querySelector('select').value,
                    image: imageUrl || '',
                    timestamp: new Date()
                });
            }).then(function() {
                alert("✅ Actualité publiée !");
                newsForm.reset();
            }).catch(function(err) {
                alert("❌ Erreur : " + err.message);
            }).finally(function() {
                btn.textContent = "PUBLIER L'ACTUALITÉ";
                btn.disabled = false;
            });
        });
    }

    // Event form
    var eventForm = document.getElementById('form-add-event');
    if (eventForm) {
        eventForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var btn = eventForm.querySelector('button[type="submit"]');
            btn.textContent = "PUBLICATION...";
            btn.disabled = true;

            var fileInput = document.getElementById('event-img-file');
            var uploadPromise = (fileInput && fileInput.files[0]) ? uploadToImgBB(fileInput.files[0]) : Promise.resolve('');

            uploadPromise.then(function(imageUrl) {
                return db.collection("events").add({
                    title: document.getElementById('event-title').value,
                    type: document.getElementById('event-type').value,
                    date_label: document.getElementById('event-date-label').value,
                    price: document.getElementById('event-price').value,
                    capacity: document.getElementById('event-capacity').value,
                    description: document.getElementById('event-desc').value,
                    image: imageUrl || '',
                    status: 'OPEN',
                    date: new Date()
                });
            }).then(function() {
                alert("✅ Évènement / Formation créé(e) !");
                eventForm.reset();
            }).catch(function(err) {
                alert("❌ Erreur : " + err.message);
            }).finally(function() {
                btn.textContent = "PUBLIER";
                btn.disabled = false;
            });
        });
    }
}

/* ============================================
   7. LOAD LEADS (Admin)
   ============================================ */
function loadLeads() {
    var container = document.getElementById('admin-leads-list');
    if (!container) return;

    db.collection("leads").orderBy("timestamp", "desc").get()
        .then(function(snap) {
            if (snap.empty) {
                container.innerHTML = '<p style="color:var(--text-muted);">Aucun lead pour le moment.</p>';
                return;
            }
            container.innerHTML = '';
            snap.forEach(function(doc) {
                var d = doc.data();
                var dateStr = d.timestamp && d.timestamp.toDate ? new Date(d.timestamp.toDate()).toLocaleDateString('fr-FR') : '';
                container.innerHTML += '<div class="stat-card" style="margin-bottom:1.5rem;"><h4>' + (d.name || 'Anonyme') + '</h4><p style="color:var(--blue-tech);margin:0.5rem 0;">' + (d.email || '') + '</p><p style="color:var(--text-muted);font-size:0.85rem;">' + (d.message || '') + '</p><small style="color:rgba(255,255,255,0.3);">' + dateStr + '</small></div>';
            });
        })
        .catch(function(e) { console.log("Leads error:", e); });
}

/* ============================================
   EVENT ADMIN WORKFLOWS
   ============================================ */
var currentManagedEventId = null;
var currentManagedEventTitle = "";

function showEventAdminTab(tab) {
    document.getElementById('admin-events-list').style.display = 'none';
    document.getElementById('admin-events-create').style.display = 'none';
    document.getElementById('admin-event-manage').style.display = 'none';
    
    document.getElementById('btn-ev-list').className = 'btn-secondary';
    document.getElementById('btn-ev-create').className = 'btn-secondary';
    
    if (tab === 'list') {
        document.getElementById('admin-events-list').style.display = 'block';
        document.getElementById('btn-ev-list').className = 'btn-primary';
        loadAdminEventsList();
    } else if (tab === 'create') {
        document.getElementById('admin-events-create').style.display = 'block';
        document.getElementById('btn-ev-create').className = 'btn-primary';
    } else if (tab === 'manage') {
        document.getElementById('admin-event-manage').style.display = 'block';
    }
}

function loadAdminEventsList() {
    var grid = document.getElementById('admin-events-grid');
    if (!grid) return;

    db.collection("events").orderBy("date", "desc").get()
        .then(function(snap) {
            if (snap.empty) {
                grid.innerHTML = '<p style="color:var(--text-muted);">Aucun évènement publié.</p>';
                return;
            }
            grid.innerHTML = '';
            snap.forEach(function(doc) {
                var d = doc.data();
                var btnTitle = d.title.replace(/'/g, "\\'");
                var isClosed = d.status === 'CLOSED';
                var statusBadge = isClosed ? '<span style="color:#ff4444; border:1px solid #ff4444; padding:0.2rem 0.5rem; font-size:0.6rem; font-family:var(--font-mono);">CLÔTURÉ</span>' : '<span style="color:#00e676; border:1px solid #00e676; padding:0.2rem 0.5rem; font-size:0.6rem; font-family:var(--font-mono);">OUVERT</span>';
                
                grid.innerHTML += '<div class="stat-card" style="display:flex; justify-content:space-between; align-items:center; opacity:' + (isClosed ? '0.6' : '1') + ';">' + 
                    '<div><div style="display:flex; gap:0.5rem; margin-bottom:0.5rem;"><div class="event-badge" style="margin:0; font-size:0.6rem; padding:0.2rem 0.6rem;">' + d.type + '</div>' + statusBadge + '</div>' + 
                    '<h3 style="margin:0;">' + d.title + '</h3><small style="color:var(--text-muted);">' + (d.date_label||'') + '</small></div>' + 
                    '<div style="display:flex; gap:0.5rem;">' +
                        '<button onclick="toggleEventStatus(\'' + doc.id + '\', \'' + (d.status || 'OPEN') + '\')" style="background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;" title="' + (isClosed ? 'Ré-ouvrir' : 'Clôturer') + '">' + (isClosed ? '🟢' : '🔴') + '</button>' +
                        '<button onclick="copyEventLink(\'' + doc.id + '\')" style="background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;" title="Lien de partage">🔗</button>' +
                        '<button class="btn-primary" onclick="manageEvent(\'' + doc.id + '\', \'' + btnTitle + '\', \'' + d.type + '\')" style="padding:0.5rem 1rem;">GÉRER</button>' +
                    '</div>' +
                '</div>';
            });
        }).catch(function(e) { console.log(e); });
}

function toggleEventStatus(eventId, currentStatus) {
    if(!confirm("Voulez-vous changer le statut (Ouvert/Clôturé) de cet évènement ?")) return;
    var newStatus = (currentStatus === 'OPEN') ? 'CLOSED' : 'OPEN';
    db.collection("events").doc(eventId).update({ status: newStatus })
        .then(function() { 
            alert('✅ Statut mis à jour : ' + newStatus);
            loadAdminEventsList(); 
        })
        .catch(function(err) { alert('❌ Erreur: ' + err.message); });
}

function copyEventLink(id) {
    // Generate events.html link, auto-selecting based on current domain layout.
    var baseLink = window.location.href.split('admin.html')[0];
    var publicLink = baseLink + 'events.html?register=' + id;
    
    // Copy to clipboard fallback properly
    navigator.clipboard.writeText(publicLink).then(function() {
        alert("🔗 Lien direct copié ! Ce lien redirigera les utilisateurs vers le formulaire de paiement.");
    }).catch(function() {
        alert("Lien : " + publicLink);
    });
}

function manageEvent(eventId, title, type) {
    currentManagedEventId = eventId;
    currentManagedEventTitle = title;
    
    document.getElementById('mg-event-title').textContent = title;
    document.getElementById('mg-event-type').textContent = type || 'ÉVÈNEMENT';
    showEventAdminTab('manage');
    
    var container = document.getElementById('admin-event-inscriptions');
    container.innerHTML = '<p class="loading-msg">Chargement des participants...</p>';
    
    db.collection("inscriptions").where("eventId", "==", eventId).get()
        .then(function(snap) {
            document.getElementById('mg-event-stats').textContent = snap.size + ' Inscrit(s)';
            if (snap.empty) {
                container.innerHTML = '<p style="color:var(--text-muted);">Aucune inscription pour l\'instant.</p>';
                return;
            }
            container.innerHTML = '<div style="background:white; color:black; padding:2rem; border-radius:4px;" id="export-target-container"><h2 style="margin-bottom:1rem; border-bottom:2px solid var(--orange-action); padding-bottom:1rem; font-family:var(--font-mono);">' + title + ' - Participants</h2><table style="width:100%; border-collapse:collapse; text-align:left;" id="inscriptions-table"><tr style="background:#eee; font-family:var(--font-mono); font-size:0.8rem;"><th style="padding:0.8rem;">NOM</th><th style="padding:0.8rem;">EMAIL</th><th style="padding:0.8rem;">TÉLÉPHONE</th><th style="padding:0.8rem;">PASS</th><th style="padding:0.8rem;">DATE</th><th style="padding:0.8rem; text-align:center;">DIPLÔME</th></tr>';
            
            // Client-side sort to avoid Firebase Composite Index requirement
            var docs = [];
            snap.forEach(function(doc) { docs.push(doc); });
            docs.sort(function(a, b) {
                var tA = a.data().timestamp ? a.data().timestamp.toMillis() : 0;
                var tB = b.data().timestamp ? b.data().timestamp.toMillis() : 0;
                return tB - tA; // Descending order (newest first)
            });

            var index = 0;
            docs.forEach(function(doc) {
                var d = doc.data();
                var dateStr = d.timestamp && d.timestamp.toDate ? new Date(d.timestamp.toDate()).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' }) : '';
                var bg = (index % 2 === 0) ? '' : 'background:#f9f9f9;';
                var tierBadge = d.tier === 'PREMIUM' ? '<span style="background:var(--orange-action); color:white; padding:0.2rem 0.5rem; border-radius:20px; font-size:0.7rem; font-family:var(--font-mono);">PREMIUM</span>' : '<span style="background:#ddd; color:#333; padding:0.2rem 0.5rem; border-radius:20px; font-size:0.7rem; font-family:var(--font-mono);">STANDARD</span>';
                var certAction = d.tier === 'PREMIUM' ? '<button onclick="generateUserCertificate(\'' + d.name.replace(/'/g, "\\'") + '\', \'' + title.replace(/'/g, "\\'") + '\')" style="background:var(--blue-dark); color:white; border:none; padding:0.3rem 0.6rem; cursor:pointer;" title="Générer Attestation">🎓</button>' : '-';
                
                container.querySelector('table').innerHTML += '<tr style="' + bg + '"><td style="padding:0.8rem; border-bottom:1px solid #ddd; font-weight:bold;">' + (d.name||'') + '</td><td style="padding:0.8rem; border-bottom:1px solid #ddd;">' + (d.email||'') + '</td><td style="padding:0.8rem; border-bottom:1px solid #ddd;">' + (d.phone||'') + '</td><td style="padding:0.8rem; border-bottom:1px solid #ddd;">' + tierBadge + '</td><td style="padding:0.8rem; border-bottom:1px solid #ddd; font-family:var(--font-mono); font-size:0.7rem;">' + dateStr + '</td><td style="padding:0.8rem; border-bottom:1px solid #ddd; text-align:center;">' + certAction + '</td></tr>';
                index++;
            });
            container.innerHTML += '</table></div>';
        }).catch(function(e) {
            container.innerHTML = '<p style="color:red;">Erreur: Pensez à ajouter un Index Firestore (eventId) si l\'erreur persiste -> ' + e.message + '</p>';
        });
}

function downloadInscriptionsPDF() {
    var element = document.getElementById('export-target-container');
    if (!element || typeof html2pdf === 'undefined') return alert("Génération PDF indisponible ou liste vide.");
    
    var opt = {
      margin:       0.5,
      filename:     'Participants_' + currentManagedEventTitle + '.pdf',
      html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}

function generateUserCertificate(userName, eventName) {
    if (typeof html2pdf === 'undefined') return alert("Génération indisponible.");
    document.getElementById('c-name').textContent = userName;
    document.getElementById('c-event').textContent = eventName;
    document.getElementById('c-date').textContent = new Date().toLocaleDateString('fr-FR');
    
    var element = document.getElementById('cert-template');
    var zone = document.getElementById('hidden-cert-zone');
    if(zone) zone.style.display = 'block';

    var opt = {
      margin:       0,
      filename:     'Attestation_' + userName.replace(/ /g, '_') + '.pdf',
      html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff', scrollY: 0 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' } // A4 Landscape roughly
    };
    
    html2pdf().set(opt).from(element).save().then(function() {
        if(zone) zone.style.display = 'none';
        alert("🎓 Attestation générée avec succès pour " + userName);
    });
}

/* ============================================
   8. IMAGE UPLOAD (imgBB)
   ============================================ */
function uploadToImgBB(file) {
    if (!file) return Promise.resolve('');
    var fd = new FormData();
    fd.append('image', file);
    return fetch('https://api.imgbb.com/1/upload?key=' + IMGBB_KEY, { method: 'POST', body: fd })
        .then(function(res) { return res.json(); })
        .then(function(data) { return data.success ? data.data.url : ''; })
        .catch(function() { return ''; });
}

/* ============================================
   9. GLOBAL ACTIONS
   ============================================ */
function openModal(id) {
    var m = document.getElementById(id);
    if (m) m.style.display = 'flex';
}

function closeModal(id) {
    var m = document.getElementById(id);
    if (m) m.style.display = 'none';
}

function handleLogin(e) {
    e.preventDefault();
    var email = e.target.querySelector('input[type="email"]').value;
    var pwd = e.target.querySelector('input[type="password"]').value;
    var btn = e.target.querySelector('button[type="submit"]');
    btn.textContent = "CONNEXION..."; btn.disabled = true;
    
    auth.signInWithEmailAndPassword(email, pwd)
        .then(function() { window.location.href = 'admin.html'; })
        .catch(function() { alert("❌ Identifiants invalides"); })
        .finally(function() { btn.textContent = "SE CONNECTER"; btn.disabled = false; });
}

function submitLead(e) {
    e.preventDefault();
    var inputs = e.target.querySelectorAll('input');
    var textarea = e.target.querySelector('textarea');
    var btn = e.target.querySelector('button');
    btn.textContent = "ENVOI..."; btn.disabled = true;

    db.collection("leads").add({
        name: inputs[0] ? inputs[0].value : '',
        email: inputs[1] ? inputs[1].value : '',
        message: textarea ? textarea.value : '',
        timestamp: new Date()
    }).then(function() {
        alert("✅ Demande envoyée ! Réponse sous 24h.");
        e.target.reset();
    }).catch(function(err) {
        alert("❌ Erreur : " + err.message);
    }).finally(function() {
        btn.textContent = "OBTENIR MON DEVIS"; btn.disabled = false;
    });
}

function openRegisterModal(eventId, eventTitle) {
    var modal = document.getElementById('register-modal');
    if (!modal) return;
    document.getElementById('reg-event-id').value = eventId;
    document.getElementById('reg-event-title-hidden').value = eventTitle;
    document.getElementById('reg-event-title').textContent = "Inscription : " + eventTitle;
    modal.style.display = 'flex';
}

function submitRegistration(e) {
    e.preventDefault();
    var btn = e.target.querySelector('button[type="submit"]');
    var originalText = btn.textContent;
    btn.textContent = "VALIDATION..."; btn.disabled = true;

    var eventId = document.getElementById('reg-event-id').value;
    var eventTitle = document.getElementById('reg-event-title-hidden').value;
    var formName = document.getElementById('reg-name').value;
    var formEmail = document.getElementById('reg-email').value;
    var formPhone = document.getElementById('reg-phone').value;
    var formTierSelect = document.getElementById('reg-tier');
    var formTier = formTierSelect ? formTierSelect.value : 'STANDARD';

    db.collection("inscriptions").add({
        eventId: eventId,
        eventTitle: eventTitle,
        name: formName,
        email: formEmail,
        phone: formPhone,
        tier: formTier,
        timestamp: new Date()
    }).then(function(docRef) {
        e.target.reset();
        closeModal('register-modal');
        
        // Show Ticket
        var ticketModal = document.getElementById('ticket-modal');
        if (ticketModal) {
            document.getElementById('t-name').textContent = formName;
            document.getElementById('t-event').textContent = eventTitle;
            var tTypeEl = document.getElementById('t-type');
            if(tTypeEl) {
                tTypeEl.textContent = 'PASS ' + formTier;
                tTypeEl.style.background = (formTier === 'PREMIUM') ? 'var(--orange-action)' : 'var(--blue-dark)';
            }
            document.getElementById('t-id').textContent = 'ID: ' + docRef.id.toUpperCase();
            document.getElementById('t-qr').src = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=050811&data=' + docRef.id;
            ticketModal.style.display = 'flex';
        } else {
            alert("✅ Inscription confirmée !");
        }
    }).catch(function(err) {
        alert("❌ Erreur : " + err.message);
    }).finally(function() {
        btn.textContent = originalText; btn.disabled = false;
    });
}

function downloadTicket() {
    var element = document.getElementById('ticket-print-area');
    if (!element || typeof html2pdf === 'undefined') {
        alert("Génération PDF indisponible (veuillez autoriser les scripts ou utiliser un vrai serveur).");
        return;
    }
    var opt = {
      margin:       0.5,
      filename:     'Genio_Ticket.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff', scrollY: 0 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save();
}

/* ============================================
   BOOT
   ============================================ */
document.addEventListener('DOMContentLoaded', function() {
    initNavbar();
    initScrollReveal();
    showSegmentPopup();
    loadNews();
    loadEvents();
    initAdmin();

    // Contact form
    var contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) { submitLead(e); });
    }

    // Login form
    var loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) { handleLogin(e); });
    }

    // Register Event form
    var registerForm = document.getElementById('form-register-event');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) { submitRegistration(e); });
    }

    // Close auth modal
    var closeAuth = document.getElementById('close-auth');
    if (closeAuth) {
        closeAuth.addEventListener('click', function() { closeModal('auth-modal'); });
    }
});
