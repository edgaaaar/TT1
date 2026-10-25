// Sidebar Toggle
function toggleSidebar() {
    document.getElementById('sidebar-context').classList.toggle('sidebar-collapsed');
}

// Navigation Logic
function showView(viewId) {
    const views = ['main-view', 'detail-view', 'srea-dashboard', 'srea-process-view', 'srea-form-view', 'srea-ishikawa-view', 'sug-dashboard', 'sug-process-view', 'sug-form-qsf-view', 'sug-form-encuesta-view', 'sestad-dashboard', 'sestad-process-view', 'sestad-form-view', 'sestad-form-consulta-view', 'mecic-dashboard', 'mecic-process-view', 'indicas-dashboard', 'indicas-process-view', 'report-detail-view'];
    views.forEach(v => {
        const el = document.getElementById(v);
        if (el) el.classList.add('hidden');
    });
    const target = document.getElementById(viewId);
    if (target) target.classList.remove('hidden');

    // Refresh Lucide icons for new content
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function showModuleDetail(moduleName) {
    const detailView = document.getElementById('detail-view');
    const detailTitle = detailView.querySelector('h2');
    const subThemeGrid = document.getElementById('sub-theme-grid');

    detailTitle.textContent = moduleName;
    subThemeGrid.innerHTML = '';

    const subThemes = [
        { code: 'SREA', name: 'Notificación de Incidentes Relacionados con la Seguridad del Paciente (SREA)', icon: 'alert-circle' },
        { code: 'SUG', name: 'Atención de Quejas, Sugerencias y Felicitaciones (SUG)', icon: 'message-circle' },
        { code: 'SESTAD', name: 'Encuesta de Satisfacción, Trato Adecuado y Digno (SESTAD)', icon: 'smile' },
        { code: 'MECIC', name: 'Modelo de Evaluación del Expediente Clínico (MECIC)', icon: 'archive' },
        { code: 'INDICAS', name: 'Indicadores de Calidad (INDICAS II)', icon: 'bar-chart-3' }
    ];

    subThemes.forEach(theme => {
        const card = document.createElement('div');
        card.className = 'module-card';
        card.onclick = () => {
            if (theme.code === 'SREA') {
                showSREADashboard();
            } else if (theme.code === 'SUG') {
                showSUGDashboard();
            } else if (theme.code === 'SESTAD') {
                showSESTADDashboard();
            } else if (theme.code === 'MECIC') {
                showMECICDashboard();
            } else if (theme.code === 'INDICAS') {
                showINDICAsDashboard();
            } else {
                alert(`Abriendo: ${theme.name}`);
            }
        };
        card.innerHTML = `
            <div class="module-icon">
                <i data-lucide="${theme.icon}"></i>
            </div>
            <h3 class="module-title" style="font-size: 0.95rem; margin-bottom: 0;">${theme.name}</h3>
        `;
        subThemeGrid.appendChild(card);
    });

    showView('detail-view');
}

let incidentesLocales = [];

function showSREADashboard() {
    const tbody = document.getElementById('srea-table-body');
    tbody.innerHTML = '';

    // Update stats
    const total = incidentesLocales.length;
    const centinela = incidentesLocales.filter(i => i.type === 'Evento Centinela').length;
    const adverso = incidentesLocales.filter(i => i.type === 'Evento Adverso').length;
    const cuasifalla = incidentesLocales.filter(i => i.type === 'Cuasifalla' || i.type === 'Cuasi-falla').length;

    const elTotal = document.getElementById('srea-stat-total');
    const elCentinela = document.getElementById('srea-stat-centinela');
    const elAdverso = document.getElementById('srea-stat-adverso');
    const elCuasifalla = document.getElementById('srea-stat-cuasifalla');

    if (elTotal) elTotal.innerText = total;
    if (elCentinela) elCentinela.innerText = centinela;
    if (elAdverso) elAdverso.innerText = adverso;
    if (elCuasifalla) elCuasifalla.innerText = cuasifalla;

    if (incidentesLocales.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 3rem 1rem; color: #64748b;">
                    <i data-lucide="inbox" size="48" style="color: #cbd5e1; margin-bottom: 1rem; display: block; margin-left: auto; margin-right: auto;"></i>
                    <p style="font-size: 1.1rem; font-weight: 600;">No hay reportes registrados aún.</p>
                    <p style="font-size: 0.95rem;">Haz clic en 'Agregar Formulario' para comenzar.</p>
                </td>
            </tr>
        `;
    } else {
        incidentesLocales.forEach(report => {
            const tr = document.createElement('tr');
            // Badge customization
            let badgeContent = `<span class="status-badge badge-${report.class}">${report.type}</span>`;
            if (report.type === 'Análisis Causa-Efecto') {
                badgeContent = `<span class="status-badge" style="background: #e0f2fe; color: #0284c7; border: 1px solid #7dd3fc;"><i data-lucide="git-branch" size="14" style="margin-right:4px;"></i>Análisis Causa-Efecto</span>`;
            }

            tr.innerHTML = `
                <td style="font-weight: 600;">${report.folio}</td>
                <td>${report.date}</td>
                <td>${badgeContent}</td>
                <td>${report.area}</td>
                <td><strong>${report.status}</strong></td>
                <td><button class="btn-read" onclick='readReportReadOnly("${report.folio}")'>Leer Reporte</button></td>
            `;
            tbody.appendChild(tr);
        });
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    showView('srea-dashboard');
}

function filterSREATable(query) {
    if (!query) {
        showSREADashboard();
        return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = incidentesLocales.filter(i =>
        (i.folio && i.folio.toLowerCase().includes(lowerQuery)) ||
        (i.area && i.area.toLowerCase().includes(lowerQuery))
    );

    const tbody = document.getElementById('srea-table-body');
    tbody.innerHTML = '';

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem 1rem; color: #64748b;">
                    <p style="font-weight: 600;">No se encontraron resultados para "${query}".</p>
                </td>
            </tr>
        `;
    } else {
        filtered.forEach(report => {
            const tr = document.createElement('tr');
            let badgeContent = `<span class="status-badge badge-${report.class}">${report.type}</span>`;
            if (report.type === 'Análisis Causa-Efecto') {
                badgeContent = `<span class="status-badge" style="background: #e0f2fe; color: #0284c7; border: 1px solid #7dd3fc;"><i data-lucide="git-branch" size="14" style="margin-right:4px;"></i>Análisis Causa-Efecto</span>`;
            }

            tr.innerHTML = `
                <td style="font-weight: 600;">${report.folio}</td>
                <td>${report.date}</td>
                <td>${badgeContent}</td>
                <td>${report.area}</td>
                <td><strong>${report.status}</strong></td>
                <td><button class="btn-read" onclick='readReportReadOnly("${report.folio}")'>Leer Reporte</button></td>
            `;
            tbody.appendChild(tr);
        });
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

let currentClassification = null;

function toggleClasificacion(isCorrect) {
    const section = document.getElementById('clasificacion-section');
    if (isCorrect) {
        section.style.opacity = '1';
        section.style.pointerEvents = 'auto';
    } else {
        section.style.opacity = '0.4';
        section.style.pointerEvents = 'none';

        // Reset valid state if unchecked
        currentClassification = null;
        document.querySelectorAll('.btn-class').forEach(b => {
            b.classList.remove('selected-centinela', 'selected-adverso', 'selected-cuasifalla');
        });
    }
}

function selectClassification(btn, type) {
    document.querySelectorAll('.btn-class').forEach(b => {
        b.classList.remove('selected-centinela', 'selected-adverso', 'selected-cuasifalla');
    });
    btn.classList.add(`selected-${type}`);
    currentClassification = type;
}

function saveToSQL() {
    if (!currentClassification) {
        alert("Por favor, seleccione una clasificación del incidente.");
        return;
    }

    const btn = event.currentTarget;
    const origHtml = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Ejecutando...';
    lucide.createIcons();

    setTimeout(() => {
        btn.innerHTML = origHtml;
        moveToStep3();
    }, 1200);
}

function moveToStep3() {
    document.getElementById('step2-icon').style.background = '#10b981';
    document.getElementById('step2-icon').style.borderColor = '#10b981';
    document.getElementById('step2-icon').style.boxShadow = 'none';
    document.getElementById('step2-icon').innerHTML = '<i data-lucide="check" size="16"></i>';
    document.getElementById('step2-text').style.color = '#10b981';

    document.getElementById('step3-icon').style.background = 'var(--primary)';
    document.getElementById('step3-icon').style.borderColor = '#fff';
    document.getElementById('step3-icon').style.boxShadow = '0 0 0 2px var(--primary)';
    document.getElementById('step3-icon').style.color = 'white';
    document.getElementById('step3-icon').style.fontWeight = '700';
    document.getElementById('step3-text').style.color = 'var(--primary)';
    document.getElementById('step3-text').style.fontWeight = '700';

    document.getElementById('form-area-step2').classList.add('hidden');
    document.getElementById('form-area-step3').classList.remove('hidden');

    if (currentClassification === 'centinela') {
        document.getElementById('flow-centinela').classList.remove('hidden');
    } else {
        document.getElementById('flow-adverso').classList.remove('hidden');
    }

    lucide.createIcons();
}

function finishProcess() {
    alert("Proceso finalizado: Incidente Gestionado guardado correctamente en la Base de Datos y reportes estadísticos.");
    showView('srea-dashboard');
}

function handlePDFUpload(input) {
    if (input.files && input.files[0]) {
        const fileName = input.files[0].name;
        document.getElementById('uploaded-filename').textContent = `Archivo cargado: ${fileName}`;

        const btn = input.nextElementSibling;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Cargando...';
        lucide.createIcons();

        // Reset state
        document.getElementById('datos-correctos').checked = false;
        toggleClasificacion(false);
        currentClassification = null;
        document.querySelectorAll('.btn-class').forEach(b => b.classList.remove('selected-centinela', 'selected-adverso', 'selected-cuasifalla'));

        document.getElementById('form-area-step2').classList.remove('hidden');
        document.getElementById('form-area-step3').classList.add('hidden');
        document.getElementById('flow-centinela').classList.add('hidden');
        document.getElementById('flow-adverso').classList.add('hidden');

        document.getElementById('step2-icon').style.background = 'var(--primary)';
        document.getElementById('step2-icon').innerHTML = '2';
        document.getElementById('step2-icon').style.borderColor = '#fff';
        document.getElementById('step2-icon').style.boxShadow = '0 0 0 2px var(--primary)';
        document.getElementById('step2-text').style.color = 'var(--primary)';

        document.getElementById('step3-icon').style.background = '#f1f5f9';
        document.getElementById('step3-icon').innerHTML = '3';
        document.getElementById('step3-icon').style.borderColor = '#e2e8f0';
        document.getElementById('step3-icon').style.boxShadow = 'none';
        document.getElementById('step3-icon').style.color = '#94a3b8';
        document.getElementById('step3-text').style.color = '#94a3b8';
        document.getElementById('step3-text').style.fontWeight = '500';

        // Uncheck boxes in step 3
        document.querySelectorAll('.action-check-list input[type="checkbox"]:not([disabled])').forEach(cb => cb.checked = false);

        setTimeout(() => {
            btn.innerHTML = originalText;
            lucide.createIcons();

            showView('srea-process-view');

            // Trigger AI algorithm scan effect
            const scanner = document.getElementById('ia-scanner');
            if (scanner) {
                scanner.style.display = 'block';
                scanner.style.animation = 'none';
                scanner.offsetHeight; /* trigger reflow */
                scanner.style.animation = 'scan 2s ease-in-out forwards';

                setTimeout(() => {
                    scanner.style.display = 'none';
                    // Show small notification that data was extracted
                }, 2000);
            }
        }, 1200);
    }
}

function startSREAFormProcess() {
    showView('srea-form-view');
    showSREAWizardStep(1);
    document.getElementById('srea-form').reset();
    const formInputs = document.getElementById('srea-form').querySelectorAll('input, select, textarea');
    formInputs.forEach(el => el.disabled = false);
    const buttons = document.getElementById('srea-form').querySelectorAll('button.btn-primary');
    buttons.forEach(b => b.style.display = 'flex');
}

function calculateSREAEdad() {
    const nac = document.getElementById('srea-fecha-nac').value;
    if (nac) {
        const diff = Date.now() - new Date(nac).getTime();
        const ageDate = new Date(diff);
        const years = Math.abs(ageDate.getUTCFullYear() - 1970);
        const months = ageDate.getUTCMonth();
        document.getElementById('srea-edad').value = `${years} años, ${months} meses`;
    }
}

// Wizard navigation state
let currentSREAStep = 1;
function showSREAWizardStep(step) {
    const totalSteps = 5;
    if (step < 1) step = 1;
    if (step > totalSteps) step = totalSteps;
    // Hide all steps
    document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
    // Show current step
    const cur = document.getElementById(`srea-step-${step}`);
    if (cur) cur.classList.add('active');
    // Update stepper UI
    document.querySelectorAll('.step-item').forEach(item => {
        const s = parseInt(item.getAttribute('data-step'));
        if (s === step) item.classList.add('active'); else item.classList.remove('active');
    });
    currentSREAStep = step;
}
function nextSREAStep() { showSREAWizardStep(currentSREAStep + 1); }
function prevSREAStep() { showSREAWizardStep(currentSREAStep - 1); }

const sreaSubcategories = {
    "1": { type: "checkbox", label: "Administración clínica", options: ["Prescripción/solicitud", "Cita", "Derivación/interconsulta", "Ingreso", "Alta/Egreso", "Traslado intra/extrahospitalario", "Identificación incorrecta", "Consentimiento informado", "Asignación de tareas", "Respuesta a una urgencia"] },
    "2": { type: "checkbox", label: "Proceso/procedimiento clínico", options: ["Diagnóstico/evaluación", "Procedimiento/tratamiento/intervención", "Atención/tratamiento general", "Análisis/pruebas", "Muestras/resultados", "Otros"] },
    "3": { type: "checkbox", label: "Nutrición", options: ["Preparación/cocinado", "Suministro/pedido", "Presentación", "Dispensación/asignación", "Distribución", "Administración", "Conservación", "Otros"] },
    "4": { type: "checkbox", label: "Sangre/productos sanguíneos", options: ["Pruebas pre transfusionales", "Prescripción", "Preparación", "Dispensación/Distribución", "Administración", "Conservación", "Otros"] },
    "5": { type: "checkbox", label: "Medicación/líquidos IV", options: ["Prescripción", "Transcripción", "Preparación", "Dispensación/Distribución", "Administración", "Presentación/envasado", "Monitorización de efectos", "Selección", "Suministro/pedido", "Almacenamiento"] },
    "6": { type: "mixed", label: "Accidentes de los pacientes", options: ["Fuerza no penetrante (checkbox)", "Contacto con objeto (checkbox)", "Contacto con persona (checkbox)", "Aplastamiento (checkbox)", "Fuerza punzante/penetrante (checkbox)", "Abrasión/roce/quemadura (checkbox)", "Rasguño/corte/desgarro/sección (checkbox)", "Pinchazo/herida punzante (checkbox)", "Mecanismo térmico: Calor excesivo (radio)", "Mecanismo térmico: Frío excesivo (radio)", "Caídas: Tropezón/traspié (radio)", "Caídas: Resbalón (radio)", "Caídas: Desmayo (radio)", "Caídas: Pérdida de equilibrio (radio)", "Caídas: Otros (radio)"] },
    "7": { type: "checkbox", label: "Comportamiento", options: ["Incumplido/no colaborador", "Desconsiderado/grosero", "Arriesgado/imprudente", "Uso/abuso de sustancias", "Acoso", "Discriminación/prejuicio", "Vagabundeo/fugas", "Autolesión/suicidio", "Agresión verbal", "Agresión física", "Agresión sexual", "Agresión a objeto", "Amenaza de muerte"] },
    "8": { type: "checkbox", label: "Infección Asociada a la Atención de Salud", options: ["Torrente sanguíneo", "Sitio quirúrgico", "Absceso", "Neumonía", "Cánulas intravasculares", "Prótesis/sitio infectado", "Sonda/drenaje urinario", "Tejidos blandos", "Otros"] },
    "9": { type: "checkbox", label: "Dispositivos/equipos médicos", options: ["No prendió", "Suministro eléctrico", "Dio toques", "Desconocimiento del funcionamiento", "Se quemó", "Desconexión", "Se rompió", "Indica error", "Se cayó o golpeó", "No sonó alarma", "Empaque maltratado", "Insuficiente suministro neumático", "Uso diferente al indicado", "Información incompleta", "No funciona/se bloqueó", "Falló (Especifique)", "Otros"] },
    "10": { type: "text", label: "Infraestructuras/locales/instalaciones", placeholder: "Especificar infraestructura/instalación" },
    "11": { type: "checkbox", label: "Recursos/gestión de la organización", options: ["Adaptación de carga de trabajo", "Disponibilidad de camas/servicios", "Disponibilidad de personal", "Organización de equipos", "Disponibilidad de protocolos/directrices"] },
    "12": { type: "checkbox", label: "Documentación", options: ["Pedidos/solicitudes", "Hojas de evolución/clínicas", "Formularios/certificados", "Instrucciones/procedimientos", "Etiquetas/pulseras", "Cartas/correos", "Informes/resultados"] },
    "13": { type: "checkbox", label: "Oxígeno/gases/vapores", options: ["Etiquetas de la botella/código de colores"] }
};

function handleSREACategoryChange(selectElement) {
    const val = selectElement.value;
    const container = document.getElementById('srea-subcategoria-container');
    const condicionales = document.getElementById('srea-campos-condicionales');

    container.innerHTML = '';

    // Condicionales Sección 3
    if (val === "9" || val === "5") {
        condicionales.classList.remove('hidden');
    } else {
        condicionales.classList.add('hidden');
    }

    if (!val) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');
    const data = sreaSubcategories[val];

    let html = `<h4 class="sub-label">${data.label}</h4>`;

    if (data.type === 'text') {
        html += `<input type="text" class="form-input" placeholder="${data.placeholder}">`;
    } else if (data.type === 'checkbox') {
        html += `<div class="checkbox-inline-group">`;
        data.options.forEach(opt => {
            if (opt === 'Otros' || opt === 'Falló (Especifique)') {
                html += `
                <div style="display: inline-flex; align-items: center; gap: 8px;">
                    <input type="checkbox" onchange="this.nextElementSibling.disabled = !this.checked">
                    <input type="text" class="form-input" placeholder="${opt}" disabled style="padding: 0.3rem 0.6rem;">
                </div>`;
            } else {
                html += `<label><input type="checkbox"> ${opt}</label>`;
            }
        });
        html += `</div>`;
    } else if (data.type === 'mixed') {
        html += `<div class="checkbox-inline-group">`;
        data.options.forEach(opt => {
            if (opt.includes('(checkbox)')) {
                html += `<label><input type="checkbox"> ${opt.replace(' (checkbox)', '')}</label>`;
            } else if (opt.includes('(radio)')) {
                html += `<label><input type="radio" name="srea-cat6-radio"> ${opt.replace(' (radio)', '')}</label>`;
            }
        });
        html += `</div>`;
    }

    container.innerHTML = html;
}

function handleSREASubcategoryChange(selectElement) {
    const val = selectElement.value;
    const extraDiv = document.getElementById('srea-extra-input');
    if (val && (val.toLowerCase().includes('otros') || val.toLowerCase().includes('especifique'))) {
        extraDiv.style.display = 'block';
    } else {
        extraDiv.style.display = 'none';
    }
}

// ======================= Ishikawa & DB Simulation Logic =======================

function startIshikawaFormProcess() {
    showView('srea-ishikawa-view');
    // Populate select
    const select = document.getElementById('ishikawa-folio-vinculado');
    select.innerHTML = '<option value="">Seleccione un incidente previo o déjelo en blanco</option>';
    incidentesLocales.filter(i => i.type !== 'Análisis Causa-Efecto').forEach(inc => {
        select.innerHTML += `<option value="${inc.folio}">${inc.folio} - ${inc.rawData.paciente} (${inc.date})</option>`;
    });
    // Clear form
    document.getElementById('ishikawa-form').reset();
    document.getElementById('table-cronologia').querySelector('tbody').innerHTML = '';
    document.getElementById('table-mejoras').querySelector('tbody').innerHTML = '';
    document.querySelectorAll('.causas-container').forEach(c => c.innerHTML = '');
    document.querySelectorAll('.selectable-card').forEach(c => c.classList.remove('active'));
    document.getElementById('ishikawa-efecto-espejo').value = '';

    // Default row
    addChronologyRow();
    addImprovementRow();

    // Enable all inputs
    const formInputs = document.getElementById('ishikawa-form').querySelectorAll('input, select, textarea, button');
    formInputs.forEach(el => el.disabled = false);
    document.getElementById('btn-save-ishikawa').style.display = 'flex';
    document.querySelectorAll('.btn-add-row, .btn-remove-row, .btn-add-causa').forEach(btn => btn.style.display = 'flex');
}

function autoFillIshikawaData(folio) {
    if (!folio) return;
    const inc = incidentesLocales.find(i => i.folio === folio);
    if (inc && inc.rawData) {
        document.getElementById('ishikawa-nombre').value = inc.rawData.paciente || '';
        document.getElementById('ishikawa-servicio').value = inc.rawData.servicio || '';

        // Check radio for classification
        const radios = document.getElementsByName('ishikawa-tipo-incidencia');
        for (let r of radios) {
            if (r.value === inc.rawData.clasificacion) r.checked = true;
        }

        const descArea = document.getElementById('ishikawa-descripcion-problema');
        descArea.value = inc.rawData.descripcion || '';
        syncIshikawaProblema();
    }
}

function calculateIshikawaEdad() {
    const nac = document.getElementById('ishikawa-fecha-nac').value;
    if (nac) {
        const diff = Date.now() - new Date(nac).getTime();
        const ageDate = new Date(diff);
        const years = Math.abs(ageDate.getUTCFullYear() - 1970);
        document.getElementById('ishikawa-edad').value = years;
    }
}

function selectGravityCard(card, value) {
    // Read only mode check
    if (document.getElementById('ishikawa-nombre').disabled) return;

    document.querySelectorAll('.selectable-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    document.getElementById('ishikawa-gravedad-seleccionada').value = value;
}

function addChronologyRow() {
    const tbody = document.getElementById('table-cronologia').querySelector('tbody');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><input type="datetime-local"></td>
        <td><input type="text" placeholder="Ej. Quirófano 3"></td>
        <td><textarea rows="2" placeholder="Describa los hechos..."></textarea></td>
        <td style="text-align: center;"><button type="button" class="btn-remove-row" onclick="removeRow(this)"><i data-lucide="trash-2" size="18"></i></button></td>
    `;
    tbody.appendChild(tr);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function addImprovementRow() {
    const tbody = document.getElementById('table-mejoras').querySelector('tbody');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><input type="text" placeholder="Ej. Capacitación al personal"></td>
        <td><input type="text" placeholder="Ej. Jefe de Enfermería"></td>
        <td><input type="date"></td>
        <td style="text-align: center;"><button type="button" class="btn-remove-row" onclick="removeRow(this)"><i data-lucide="trash-2" size="18"></i></button></td>
    `;
    tbody.appendChild(tr);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function removeRow(btn) {
    btn.closest('tr').remove();
}

function addIshikawaCause(category) {
    const container = document.getElementById(`causas-${category}`);
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.gap = '8px';
    div.innerHTML = `
        <input type="text" class="form-input" placeholder="Describa la causa..." style="flex: 1;">
        <button type="button" class="btn-remove-row" style="padding: 0.3rem;" onclick="this.parentElement.remove()"><i data-lucide="x" size="16"></i></button>
    `;
    container.appendChild(div);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function syncIshikawaProblema() {
    document.getElementById('ishikawa-efecto-espejo').value = document.getElementById('ishikawa-descripcion-problema').value;
}

function getCurrentDateFormatted() {
    const d = new Date();
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i data-lucide="check-circle" size="24" style="color: #10b981;"></i> <span style="font-weight: 600; color: #1e293b;">${message}</span>`;
    container.appendChild(toast);
    if (typeof lucide !== 'undefined') lucide.createIcons();

    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function saveSREAForm() {
    const prevCount = incidentesLocales.filter(i => i.folio.startsWith('SREA')).length;
    const newFolio = `SREA-2026-${(prevCount + 1).toString().padStart(3, '0')}`;

    const servicio = document.getElementById('srea-servicio').value || 'Desconocido';
    const pacienteInputs = document.querySelectorAll('#srea-form input[placeholder="Nombre(s)"]');
    const paciente = pacienteInputs.length ? pacienteInputs[0].value : 'Desconocido';

    const catSelect = document.getElementById('srea-categoria-incidente');
    let typeLabel = 'Evento Adverso';
    if (catSelect && catSelect.selectedIndex > 0) {
        typeLabel = catSelect.options[catSelect.selectedIndex].text;
    }

    incidentesLocales.push({
        folio: newFolio,
        date: getCurrentDateFormatted(),
        type: typeLabel.replace(/^[0-9]+\.\s*/, ''),
        area: servicio,
        status: 'Registrado',
        class: 'adverse',
        rawData: { paciente, servicio, clasificacion: "Evento Adverso", descripcion: "" },
        isFormSREA: true
    });

    showSREADashboard();
    showToast(`Incidente ${newFolio} guardado exitosamente`);
}

function saveIshikawaForm() {
    const prevCount = incidentesLocales.filter(i => i.folio.startsWith('ACA')).length;
    const newFolio = `ACA-2026-${(prevCount + 1).toString().padStart(3, '0')}`;

    const servicio = document.getElementById('ishikawa-servicio').value || 'N/A';
    const paciente = document.getElementById('ishikawa-nombre').value || 'N/A';

    incidentesLocales.push({
        folio: newFolio,
        date: getCurrentDateFormatted(),
        type: 'Análisis Causa-Efecto',
        area: servicio,
        status: 'Completado',
        class: 'sugerencia',
        rawData: { paciente, servicio },
        isFormACA: true
    });

    showSREADashboard();
    showToast(`Análisis ${newFolio} guardado exitosamente`);
}

function readReportReadOnly(folio) {
    const report = incidentesLocales.find(i => i.folio === folio);
    if (!report) return;

    if (folio.startsWith('SREA')) {
        showView('srea-form-view');
        const formInputs = document.getElementById('srea-form').querySelectorAll('input, select, textarea');
        formInputs.forEach(el => el.disabled = true);

        // Hide save button
        const buttons = document.getElementById('srea-form').querySelectorAll('button.btn-primary');
        buttons.forEach(b => b.style.display = 'none');

    } else if (folio.startsWith('ACA')) {
        showView('srea-ishikawa-view');
        const formInputs = document.getElementById('ishikawa-form').querySelectorAll('input, select, textarea, button');
        formInputs.forEach(el => {
            if (!el.classList.contains('btn-back')) {
                el.disabled = true;
            }
        });
        document.getElementById('btn-save-ishikawa').style.display = 'none';

        // Hide action buttons in tables and grid
        document.querySelectorAll('.btn-add-row, .btn-remove-row, .btn-add-causa').forEach(btn => btn.style.display = 'none');
    }
}



// ======================= SUG Logic =======================

let sugerenciasLocales = [];

function showSUGDashboard() {
    const tbody = document.getElementById('sug-table-body');
    tbody.innerHTML = '';

    const total = sugerenciasLocales.length;
    const quejas = sugerenciasLocales.filter(i => i.type === 'Queja').length;
    const sugerencias = sugerenciasLocales.filter(i => i.type === 'Sugerencia').length;
    const felicitaciones = sugerenciasLocales.filter(i => i.type === 'Felicitación').length;

    const elTotal = document.getElementById('sug-stat-total');
    const elQuejas = document.getElementById('sug-stat-quejas');
    const elSugerencias = document.getElementById('sug-stat-sugerencias');
    const elFelicitaciones = document.getElementById('sug-stat-felicitaciones');

    if (elTotal) elTotal.innerText = total;
    if (elQuejas) elQuejas.innerText = quejas;
    if (elSugerencias) elSugerencias.innerText = sugerencias;
    if (elFelicitaciones) elFelicitaciones.innerText = felicitaciones;

    if (sugerenciasLocales.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 3rem 1rem; color: #64748b;">
                    <i data-lucide="inbox" size="48" style="color: #cbd5e1; margin-bottom: 1rem; display: block; margin-left: auto; margin-right: auto;"></i>
                    <p style="font-size: 1.1rem; font-weight: 600;">No hay registros de QSF aún.</p>
                    <p style="font-size: 0.95rem;">Haz clic en 'Registrar Nueva QSF' para comenzar.</p>
                </td>
            </tr>
        `;
    } else {
        sugerenciasLocales.forEach(report => {
            const tr = document.createElement('tr');
            let badgeClass = 'badge-adverse'; // default
            if (report.type === 'Queja' || report.type === 'Reclamo') badgeClass = 'badge-sentinel';
            if (report.type === 'Sugerencia') badgeClass = 'badge-nearmiss';
            if (report.type === 'Felicitación') badgeClass = 'badge-success';
            if (report.type === 'Encuesta de Calidad') badgeClass = 'badge-adverse';

            tr.innerHTML = `
                <td style="font-weight: 600;">${report.folio}</td>
                <td>${report.date}</td>
                <td>${report.medio}</td>
                <td><span class="status-badge ${badgeClass}">${report.type}</span></td>
                <td><strong>${report.status}</strong></td>
                <td><button class="btn-read" onclick='readSUGReport("${report.folio}")'>Ver Detalle</button></td>
            `;
            tbody.appendChild(tr);
        });
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
    showView('sug-dashboard');
}

function filterSUGTable(query) {
    if (!query) {
        showSUGDashboard();
        return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = sugerenciasLocales.filter(i =>
        (i.folio && i.folio.toLowerCase().includes(lowerQuery)) ||
        (i.medio && i.medio.toLowerCase().includes(lowerQuery)) ||
        (i.type && i.type.toLowerCase().includes(lowerQuery))
    );

    const tbody = document.getElementById('sug-table-body');
    tbody.innerHTML = '';

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem 1rem; color: #64748b;">
                    <p style="font-weight: 600;">No se encontraron resultados para "${query}".</p>
                </td>
            </tr>
        `;
    } else {
        filtered.forEach(report => {
            const tr = document.createElement('tr');
            let badgeClass = 'badge-adverse';
            if (report.type === 'Queja' || report.type === 'Reclamo') badgeClass = 'badge-sentinel';
            if (report.type === 'Sugerencia') badgeClass = 'badge-nearmiss';
            if (report.type === 'Felicitación') badgeClass = 'badge-success';
            if (report.type === 'Encuesta de Calidad') badgeClass = 'badge-adverse';

            tr.innerHTML = `
                <td style="font-weight: 600;">${report.folio}</td>
                <td>${report.date}</td>
                <td>${report.medio}</td>
                <td><span class="status-badge ${badgeClass}">${report.type}</span></td>
                <td><strong>${report.status}</strong></td>
                <td><button class="btn-read" onclick='readSUGReport("${report.folio}")'>Ver Detalle</button></td>
            `;
            tbody.appendChild(tr);
        });
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

function startQSFFormProcess() {
    showView('sug-form-qsf-view');
    document.getElementById('qsf-form').reset();
    document.querySelectorAll('.qsf-tipo-cards .selectable-card').forEach(c => {
        c.classList.remove('active');
        c.style.borderColor = '#e2e8f0';
        c.style.background = 'white';
    });
    document.getElementById('qsf-tipo-seleccionado').value = '';

    const formInputs = document.getElementById('qsf-form').querySelectorAll('input, select, textarea, button');
    formInputs.forEach(el => el.disabled = false);
    document.getElementById('btn-save-qsf').style.display = 'flex';
}

function selectQSFTipo(card, tipo) {
    document.querySelectorAll('.qsf-tipo-cards .selectable-card').forEach(c => {
        c.classList.remove('active');
        c.style.borderColor = '#e2e8f0';
        c.style.background = 'white';
    });
    card.classList.add('active');
    card.style.borderColor = 'var(--primary)';
    card.style.background = '#f0f9ff';
    document.getElementById('qsf-tipo-seleccionado').value = tipo;

    const titleEl = document.getElementById('qsf-user-section-title');
    const lblNombre = document.getElementById('lbl-qsf-nombre');
    const lblRegistro = document.getElementById('lbl-qsf-registro');
    const lblServicio = document.getElementById('lbl-qsf-servicio');
    const inputNombre = document.getElementById('qsf-nombre');
    
    if (titleEl && lblNombre && lblRegistro && lblServicio) {
        if (tipo === 'Queja') {
            titleEl.innerHTML = '<i data-lucide="user"></i> 3. Datos del Usuario <span style="color: #ef4444;">(Obligatorios)</span>';
            lblNombre.innerHTML = 'Nombre Completo <span style="color: #ef4444;">*</span>:';
            lblRegistro.innerHTML = 'Número de Registro / Expediente <span style="color: #ef4444;">*</span>:';
            lblServicio.innerHTML = 'Servicio / Área Involucrada <span style="color: #ef4444;">*</span>:';
            inputNombre.placeholder = "Dato obligatorio";
        } else {
            titleEl.innerHTML = '<i data-lucide="user"></i> 3. Datos del Usuario';
            lblNombre.innerHTML = 'Nombre Completo:';
            lblRegistro.innerHTML = 'Número de Registro / Expediente:';
            lblServicio.innerHTML = 'Servicio / Área Involucrada:';
            inputNombre.placeholder = "Puede ser anónimo";
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

function saveQSFForm() {
    const tipo = document.getElementById('qsf-tipo-seleccionado').value;
    if (!tipo) {
        alert("Por favor seleccione un Tipo de Aporte (Sugerencia, Queja, etc.)");
        return;
    }

    const nombre = document.getElementById('qsf-nombre').value.trim();
    const registro = document.getElementById('qsf-registro').value.trim();
    const servicio = document.getElementById('qsf-servicio').value;

    if (tipo === 'Queja') {
        if (!nombre || !registro || !servicio) {
            alert("Para registrar una QUEJA, los Datos del Usuario (Nombre, Número de Registro y Servicio) son OBLIGATORIOS.");
            return;
        }
    }

    const newFolio = `QSF-2026-${String(sugerenciasLocales.filter(i => i.folio.startsWith('QSF')).length + 1).padStart(3, '0')}`;
    const medio = document.getElementById('qsf-medio').value;
    const fecha = document.getElementById('qsf-fecha').value || getCurrentDateFormatted();

    sugerenciasLocales.push({
        folio: newFolio,
        date: fecha,
        medio: medio,
        type: tipo,
        status: 'Por Clasificar',
        rawData: {
            hora: document.getElementById('qsf-hora').value,
            nombre: nombre,
            registro: registro,
            servicio: servicio,
            descripcion: document.getElementById('qsf-descripcion').value
        }
    });

    if (document.body.classList.contains('kiosk-mode')) {
        alert("¡Gracias por su aporte! Su información ha sido registrada confidencialmente.");
        startQSFFormProcess(); // Reset for next patient
    } else {
        showSUGDashboard();
        showToast(`Registro ${newFolio} guardado exitosamente`);
    }
}

// ==========================================================
// KIOSK MODE
// ==========================================================
function startKioskMode() {
    startQSFFormProcess();
    document.body.classList.add('kiosk-mode');
    showToast("Modo Kiosko Activado. Doble clic en el escudo abajo a la derecha para salir.");
}

function exitKioskMode() {
    const password = prompt("Ingrese la contraseña de administrador para salir del Modo Kiosko:");
    if (password === "admin123") {
        document.body.classList.remove('kiosk-mode');
        showSUGDashboard();
        showToast("Modo Kiosko Desactivado.");
    } else if (password !== null) {
        alert("Contraseña incorrecta.");
    }
}

function startEncuestaFormProcess() {
    showView('sug-form-encuesta-view');
    document.getElementById('encuesta-form').reset();

    const formInputs = document.getElementById('encuesta-form').querySelectorAll('input, select, textarea, button');
    formInputs.forEach(el => el.disabled = false);
    document.getElementById('btn-save-encuesta').style.display = 'flex';
}

function saveEncuestaForm() {
    const newFolio = `ECE-2026-${String(sugerenciasLocales.filter(i => i.folio.startsWith('ECE')).length + 1).padStart(3, '0')}`;
    const fecha = document.getElementById('encuesta-fecha').value || getCurrentDateFormatted();

    const getRadioVal = (name) => {
        const el = document.querySelector(`input[name="${name}"]:checked`);
        return el ? el.value : 'NA';
    };

    sugerenciasLocales.push({
        folio: newFolio,
        date: fecha,
        medio: 'Encuestas de Calidad',
        type: 'Encuesta de Calidad',
        status: 'En Análisis',
        rawData: {
            aplicador: document.getElementById('encuesta-aplicador').value,
            servicio: document.getElementById('encuesta-servicio').value,
            enc1: getRadioVal('enc1'), enc2: getRadioVal('enc2'), enc3: getRadioVal('enc3'),
            enc4: getRadioVal('enc4'), enc5: getRadioVal('enc5'),
            enc6: getRadioVal('enc6'), enc7: getRadioVal('enc7'), enc8: getRadioVal('enc8'),
            comentarios: document.getElementById('encuesta-comentarios').value
        }
    });

    showSUGDashboard();
    showToast(`Encuesta ${newFolio} guardada exitosamente`);
}

function readSUGReport(folio) {
    const report = sugerenciasLocales.find(i => i.folio === folio);
    if (!report) return;

    if (folio.startsWith('QSF')) {
        showView('sug-form-qsf-view');
        document.getElementById('qsf-medio').value = report.medio;
        document.getElementById('qsf-fecha').value = report.date;
        document.getElementById('qsf-hora').value = report.rawData.hora || '';
        document.getElementById('qsf-nombre').value = report.rawData.nombre || '';
        document.getElementById('qsf-registro').value = report.rawData.registro || '';
        document.getElementById('qsf-servicio').value = report.rawData.servicio || '';
        document.getElementById('qsf-descripcion').value = report.rawData.descripcion || '';

        document.getElementById('qsf-tipo-seleccionado').value = report.type;
        document.querySelectorAll('.qsf-tipo-cards .selectable-card').forEach(c => {
            c.classList.remove('active');
            c.style.borderColor = '#e2e8f0';
            c.style.background = 'white';
            const h4Text = c.querySelector('h4').innerText.toUpperCase();
            if (h4Text.includes(report.type.toUpperCase()) ||
                (report.type === 'Felicitación' && h4Text.includes('FELICIT')) ||
                (report.type === 'Sugerencia' && h4Text.includes('SUGIERO')) ||
                (report.type === 'Queja' && h4Text.includes('QUEJO')) ||
                (report.type === 'Reclamo' && h4Text.includes('RECLAMO'))) {
                c.classList.add('active');
                c.style.borderColor = 'var(--primary)';
                c.style.background = '#f0f9ff';
            }
        });

        const formInputs = document.getElementById('qsf-form').querySelectorAll('input, select, textarea, button');
        formInputs.forEach(el => {
            if (!el.classList.contains('btn-back')) el.disabled = true;
        });
        document.getElementById('btn-save-qsf').style.display = 'none';

    } else if (folio.startsWith('ECE')) {
        showView('sug-form-encuesta-view');
        document.getElementById('encuesta-fecha').value = report.date;
        document.getElementById('encuesta-aplicador').value = report.rawData.aplicador || '';
        document.getElementById('encuesta-servicio').value = report.rawData.servicio || '';
        document.getElementById('encuesta-comentarios').value = report.rawData.comentarios || '';

        for (let i = 1; i <= 8; i++) {
            const val = report.rawData[`enc${i}`];
            const radio = document.querySelector(`input[name="enc${i}"][value="${val}"]`);
            if (radio) radio.checked = true;
        }

        const formInputs = document.getElementById('encuesta-form').querySelectorAll('input, select, textarea, button');
        formInputs.forEach(el => {
            if (!el.classList.contains('btn-back')) el.disabled = true;
        });
        document.getElementById('btn-save-encuesta').style.display = 'none';
    }
}


// ======================= SESTAD Logic =======================

let encuestasLocales = [];

function showSESTADDashboard() {
    const tbody = document.getElementById('sestad-table-body');
    tbody.innerHTML = '';

    const total = encuestasLocales.length;
    const hosp = encuestasLocales.filter(i => i.area === 'Hospitalización').length;
    const ce = encuestasLocales.filter(i => i.area === 'Consulta Externa').length;
    const urg = encuestasLocales.filter(i => i.area === 'Urgencias').length;

    const elTotal = document.getElementById('sestad-stat-total');
    const elHosp = document.getElementById('sestad-stat-hosp');
    const elCe = document.getElementById('sestad-stat-ce');
    const elUrg = document.getElementById('sestad-stat-urg');

    if (elTotal) elTotal.innerText = total;
    if (elHosp) elHosp.innerText = hosp;
    if (elCe) elCe.innerText = ce;
    if (elUrg) elUrg.innerText = urg;

    if (encuestasLocales.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 3rem 1rem; color: #64748b;">
                    <i data-lucide="inbox" size="48" style="color: #cbd5e1; margin-bottom: 1rem; display: block; margin-left: auto; margin-right: auto;"></i>
                    <p style="font-size: 1.1rem; font-weight: 600;">No hay encuestas registradas aún.</p>
                    <p style="font-size: 0.95rem;">Haz clic en 'Nueva Encuesta' para comenzar.</p>
                </td>
            </tr>
        `;
    } else {
        encuestasLocales.forEach(report => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 600;">${report.folio}</td>
                <td>${report.date}</td>
                <td>${report.area}</td>
                <td>${report.aplicador}</td>
                <td><span class="status-badge badge-nearmiss">${report.status}</span></td>
                <td><button class="btn-read" onclick='readSESTADReport("${report.folio}")'>Ver Detalle</button></td>
            `;
            tbody.appendChild(tr);
        });
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
    showView('sestad-dashboard');
}

function filterSESTADTable(query) {
    if (!query) {
        showSESTADDashboard();
        return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = encuestasLocales.filter(i =>
        (i.folio && i.folio.toLowerCase().includes(lowerQuery)) ||
        (i.area && i.area.toLowerCase().includes(lowerQuery))
    );

    const tbody = document.getElementById('sestad-table-body');
    tbody.innerHTML = '';

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem 1rem; color: #64748b;">
                    <p style="font-weight: 600;">No se encontraron resultados para "${query}".</p>
                </td>
            </tr>
        `;
    } else {
        filtered.forEach(report => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 600;">${report.folio}</td>
                <td>${report.date}</td>
                <td>${report.area}</td>
                <td>${report.aplicador}</td>
                <td><span class="status-badge badge-nearmiss">${report.status}</span></td>
                <td><button class="btn-read" onclick='readSESTADReport("${report.folio}")'>Ver Detalle</button></td>
            `;
            tbody.appendChild(tr);
        });
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

function abrirSeleccionArea() {
    document.getElementById('sestad-dashboard').classList.add('hidden');
    document.getElementById('sestad-area-selection').classList.remove('hidden');
    document.getElementById('sestad-form-view').classList.add('hidden');
    
    // Resetear form
    document.getElementById('sestad-form').reset();
    document.getElementById('sestad-cuestionario-dinamico').innerHTML = '';
}

function volverASeleccionArea() {
    document.getElementById('sestad-form-view').classList.add('hidden');
    document.getElementById('sestad-form').reset();
    document.getElementById('sestad-cuestionario-dinamico').innerHTML = '';
    document.getElementById('sestad-area-selection').classList.remove('hidden');
}

function seleccionarAreaSESTAD(area) {
    document.getElementById('sestad-area-selection').classList.add('hidden');
    document.getElementById('sestad-form-view').classList.remove('hidden');
    
    document.getElementById('sestad-area').value = area;
    const displayEl = document.getElementById('sestad-area-display');
    if (displayEl) displayEl.innerText = area;

    const container = document.getElementById('sestad-cuestionario-dinamico');
    container.innerHTML = ''; // Vaciar antes de inyectar

    renderSESTADCuestionario(area, container);
}

function cancelarEncuestaSESTAD() {
    document.getElementById('sestad-area-selection').classList.add('hidden');
    document.getElementById('sestad-form-view').classList.add('hidden');
    document.getElementById('sestad-dashboard').classList.remove('hidden');
}

function renderSESTADCuestionario(area, container) {
    let html = '';

    if (area === 'Urgencias') {
        html = `
            <div id="sestad-form-urgencias" class="form-card">
                <h3 class="form-section-title"><i data-lucide="activity"></i> 3. Cuestionario de Urgencias (URG-E)</h3>
                
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P1: ¿Le atendieron con respeto?</label>
                    <div class="checkbox-inline-group" style="margin-top: 0.5rem;">
                        <label><input type="radio" name="sestad_u_p1" value="Sí" onchange="document.getElementById('sestad-u-p1-sub').classList.add('hidden')"> Sí</label>
                        <label><input type="radio" name="sestad_u_p1" value="No" onchange="document.getElementById('sestad-u-p1-sub').classList.remove('hidden')"> No</label>
                    </div>
                </div>
                <div id="sestad-u-p1-sub" class="form-group hidden" style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #f59e0b;">
                    <label>P1.1: Seleccione el personal que no le atendió con respeto:</label>
                    <div class="checkbox-inline-group" style="margin-top: 0.5rem;">
                        <label><input type="checkbox" name="sestad_u_p1_personal" value="Médico/Psicólogo/Dentista"> Médico/Psicólogo/Dentista</label>
                        <label><input type="checkbox" name="sestad_u_p1_personal" value="Enfermería"> Enfermería</label>
                        <label><input type="checkbox" name="sestad_u_p1_personal" value="Recepción"> Recepción</label>
                        <label><input type="checkbox" name="sestad_u_p1_personal" value="Archivo"> Archivo</label>
                        <label><input type="checkbox" name="sestad_u_p1_personal" value="Trabajo Social"> Trabajo Social</label>
                        <label><input type="checkbox" name="sestad_u_p1_personal" value="Laboratorio"> Laboratorio</label>
                        <label><input type="checkbox" name="sestad_u_p1_personal" value="Rayos X"> Rayos X</label>
                        <label><input type="checkbox" name="sestad_u_p1_personal" value="Farmacia"> Farmacia</label>
                        <label><input type="checkbox" name="sestad_u_p1_personal" value="Caja"> Caja</label>
                        <label><input type="checkbox" name="sestad_u_p1_personal" value="Vigilancia"> Vigilancia</label>
                        <label><input type="checkbox" name="sestad_u_p1_personal" value="Módulo Orientación"> Módulo Orientación</label>
                        <label><input type="checkbox" name="sestad_u_p1_personal" value="Vigencia"> Vigencia</label>
                        <label><input type="checkbox" name="sestad_u_p1_personal" value="Incapacidades"> Incapacidades</label>
                        <label><input type="checkbox" name="sestad_u_p1_personal" value="Limpieza"> Limpieza</label>
                    </div>
                </div>

                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P2: ¿Le dijeron cuánto tiempo iba a esperar?</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_u_p2" value="Sí"> Sí</label><label><input type="radio" name="sestad_u_p2" value="No"> No</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P3: ¿Cuánto tiempo esperó antes de ser atendido?</label>
                    <div class="checkbox-inline-group">
                        <label><input type="radio" name="sestad_u_p3" value="0-15 min"> 0-15 min</label>
                        <label><input type="radio" name="sestad_u_p3" value="16-30 min"> 16-30 min</label>
                        <label><input type="radio" name="sestad_u_p3" value="31-60 min"> 31-60 min</label>
                        <label><input type="radio" name="sestad_u_p3" value="Más de 60 min"> Más de 60 min</label>
                        <label><input type="radio" name="sestad_u_p3" value="No contestó"> No contestó</label>
                    </div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P4: ¿El médico le dio oportunidad de hacer preguntas?</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_u_p4" value="Sí"> Sí</label><label><input type="radio" name="sestad_u_p4" value="No"> No</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P5: ¿El médico le dio explicaciones fáciles de entender?</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_u_p5" value="Sí"> Sí</label><label><input type="radio" name="sestad_u_p5" value="No"> No</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P6: ¿Entendió cómo deberá tomar los medicamentos?</label>
                    <div class="checkbox-inline-group">
                        <label><input type="radio" name="sestad_u_p6" value="Sí"> Sí</label>
                        <label><input type="radio" name="sestad_u_p6" value="No"> No</label>
                        <label><input type="radio" name="sestad_u_p6" value="No le mandaron"> No le mandaron</label>
                    </div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P7: ¿Entendió los cuidados en casa?</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_u_p7" value="Sí"> Sí</label><label><input type="radio" name="sestad_u_p7" value="No"> No</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P8: Al decidir tratamiento, ¿tomó en cuenta necesidades?</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_u_p8" value="Sí"> Sí</label><label><input type="radio" name="sestad_u_p8" value="No"> No</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P9: ¿Dejó de realizarse estudios/tratamiento por no poder pagarlo?</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_u_p9" value="Sí"> Sí</label><label><input type="radio" name="sestad_u_p9" value="No"> No</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P10: ¿Dejó de tomar medicamento por no poder pagarlo?</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_u_p10" value="Sí"> Sí</label><label><input type="radio" name="sestad_u_p10" value="No"> No</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P11: ¿El médico pasó suficiente tiempo con usted?</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_u_p11" value="Sí"> Sí</label><label><input type="radio" name="sestad_u_p11" value="No"> No</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P12: Durante su visita, ¿tuvo dolor?</label>
                    <div class="checkbox-inline-group" style="margin-top: 0.5rem;">
                        <label><input type="radio" name="sestad_u_p12" value="Sí" onchange="document.getElementById('sestad-u-p12-sub').classList.remove('hidden')"> Sí</label>
                        <label><input type="radio" name="sestad_u_p12" value="No" onchange="document.getElementById('sestad-u-p12-sub').classList.add('hidden')"> No</label>
                    </div>
                </div>
                <div id="sestad-u-p12-sub" class="form-group hidden" style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #f59e0b;">
                    <label>P12.1: ¿Su dolor fue atendido?</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_u_p12_sub" value="Sí"> Sí</label><label><input type="radio" name="sestad_u_p12_sub" value="No"> No</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P13: ¿Qué tan satisfecho está con la calidad de atención?</label>
                    <div class="checkbox-inline-group">
                        <label><input type="radio" name="sestad_u_p13" value="Mucho"> Mucho</label>
                        <label><input type="radio" name="sestad_u_p13" value="Regular"> Regular</label>
                        <label><input type="radio" name="sestad_u_p13" value="Nada"> Nada</label>
                    </div>
                </div>
            </div>
        `;
    } else if (area === 'Consulta Externa') {
        html = `
            <div id="sestad-form-ce" class="form-card">
                <h3 class="form-section-title"><i data-lucide="stethoscope"></i> 3. Cuestionario de Consulta Externa (C.E.)</h3>
                
                <div class="form-grid" style="margin-bottom: 1.5rem;">
                    <div class="form-group">
                        <label>Procedencia:</label>
                        <input type="text" class="form-input" id="sestad-ce-procedencia" name="sestad_ce_procedencia" placeholder="Lugar de procedencia">
                    </div>
                    <div class="form-group">
                        <label>Especialidad:</label>
                        <input type="text" class="form-input" id="sestad-ce-especialidad" name="sestad_ce_especialidad" placeholder="Ej. Pediatría">
                    </div>
                </div>
                
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P1: ¿Lo atendieron con respeto?</label>
                    <div class="checkbox-inline-group" style="margin-top: 0.5rem;">
                        <label><input type="radio" name="sestad_ce_p1" value="Sí" onchange="document.getElementById('sestad-ce-p1-sub').classList.add('hidden')"> Sí</label>
                        <label><input type="radio" name="sestad_ce_p1" value="No" onchange="document.getElementById('sestad-ce-p1-sub').classList.remove('hidden')"> No</label>
                    </div>
                </div>
                <div id="sestad-ce-p1-sub" class="form-group hidden" style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #3b82f6;">
                    <label>P2: Seleccione el personal que no le atendió con respeto:</label>
                    <div class="checkbox-inline-group" style="margin-top: 0.5rem;">
                        <label><input type="checkbox" name="sestad_ce_p2_personal" value="Médico/Psicólogo/Dentista"> Médico/Psicólogo/Dentista</label>
                        <label><input type="checkbox" name="sestad_ce_p2_personal" value="Enfermería"> Enfermería</label>
                        <label><input type="checkbox" name="sestad_ce_p2_personal" value="Recepción"> Recepción</label>
                        <label><input type="checkbox" name="sestad_ce_p2_personal" value="Archivo"> Archivo</label>
                        <label><input type="checkbox" name="sestad_ce_p2_personal" value="Trabajo Social"> Trabajo Social</label>
                        <label><input type="checkbox" name="sestad_ce_p2_personal" value="Laboratorio"> Laboratorio</label>
                        <label><input type="checkbox" name="sestad_ce_p2_personal" value="Rayos X"> Rayos X</label>
                        <label><input type="checkbox" name="sestad_ce_p2_personal" value="Farmacia"> Farmacia</label>
                        <label><input type="checkbox" name="sestad_ce_p2_personal" value="Caja"> Caja</label>
                        <label><input type="checkbox" name="sestad_ce_p2_personal" value="Vigilancia"> Vigilancia</label>
                        <label><input type="checkbox" name="sestad_ce_p2_personal" value="Módulo Orientación"> Módulo Orientación</label>
                        <label><input type="checkbox" name="sestad_ce_p2_personal" value="Vigencia"> Vigencia</label>
                        <label><input type="checkbox" name="sestad_ce_p2_personal" value="Incapacidades"> Incapacidades</label>
                        <label><input type="checkbox" name="sestad_ce_p2_personal" value="Limpieza"> Limpieza</label>
                        <label><input type="checkbox" name="sestad_ce_p2_personal" value="Módulo Seguro Popular"> Módulo Seguro Popular</label>
                    </div>
                </div>

                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P3: Con el tiempo que esperó, ¿quedó satisfecho?</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_ce_p3" value="Sí"> Sí</label><label><input type="radio" name="sestad_ce_p3" value="No"> No</label><label><input type="radio" name="sestad_ce_p3" value="No aplica"> No aplica</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P4: ¿El tiempo de espera para cita fue 4 semanas o más?</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_ce_p4" value="Sí"> Sí</label><label><input type="radio" name="sestad_ce_p4" value="No"> No</label><label><input type="radio" name="sestad_ce_p4" value="No aplica"> No aplica</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P5: ¿Oportunidad de hacer preguntas?</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_ce_p5" value="Sí"> Sí</label><label><input type="radio" name="sestad_ce_p5" value="No"> No</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P6: ¿Explicaciones fáciles de entender?</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_ce_p6" value="Sí"> Sí</label><label><input type="radio" name="sestad_ce_p6" value="No"> No</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P7: ¿Le explicó sobre el estado de salud?</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_ce_p7" value="Sí"> Sí</label><label><input type="radio" name="sestad_ce_p7" value="No"> No</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P8: ¿Entendió cómo tomar medicamentos?</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_ce_p8" value="Sí"> Sí</label><label><input type="radio" name="sestad_ce_p8" value="No"> No</label><label><input type="radio" name="sestad_ce_p8" value="No recetaron"> No recetaron</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P9: ¿Entendió los cuidados en casa?</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_ce_p9" value="Sí"> Sí</label><label><input type="radio" name="sestad_ce_p9" value="No"> No</label><label><input type="radio" name="sestad_ce_p9" value="No mandaron"> No mandaron</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P10: Al decidir tratamiento, ¿tomó en cuenta necesidades?</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_ce_p10" value="Sí"> Sí</label><label><input type="radio" name="sestad_ce_p10" value="No"> No</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P11: ¿Dejó de asistir a consulta por no poder pagarla?</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_ce_p11" value="Sí"> Sí</label><label><input type="radio" name="sestad_ce_p11" value="No"> No</label><label><input type="radio" name="sestad_ce_p11" value="No cobran"> No cobran</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P12: ¿Dejó estudios/tratamiento por no poder pagarlo?</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_ce_p12" value="Sí"> Sí</label><label><input type="radio" name="sestad_ce_p12" value="No"> No</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P13: ¿Dejó medicamento por no poder pagarlo?</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_ce_p13" value="Sí"> Sí</label><label><input type="radio" name="sestad_ce_p13" value="No"> No</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P14: ¿Médico pasó suficiente tiempo con usted?</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_ce_p14" value="Sí"> Sí</label><label><input type="radio" name="sestad_ce_p14" value="No"> No</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P15: ¿Tuvo dolor?</label>
                    <div class="checkbox-inline-group" style="margin-top: 0.5rem;">
                        <label><input type="radio" name="sestad_ce_p15" value="Sí" onchange="document.getElementById('sestad-ce-p15-sub').classList.remove('hidden')"> Sí</label>
                        <label><input type="radio" name="sestad_ce_p15" value="No" onchange="document.getElementById('sestad-ce-p15-sub').classList.add('hidden')"> No</label>
                    </div>
                </div>
                <div id="sestad-ce-p15-sub" class="form-group hidden" style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #3b82f6;">
                    <label>P16: ¿Su dolor fue atendido?</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_ce_p16" value="Sí"> Sí</label><label><input type="radio" name="sestad_ce_p16" value="No"> No</label></div>
                </div>
                
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P17: En relación a medicamentos recetados:</label>
                    <div class="checkbox-inline-group" style="display: flex; flex-direction: column;">
                        <label><input type="radio" name="sestad_ce_p17" value="Le dieron todos"> Le dieron todos</label>
                        <label><input type="radio" name="sestad_ce_p17" value="Faltó alguno"> Faltó alguno</label>
                        <label><input type="radio" name="sestad_ce_p17" value="No se los dieron"> No se los dieron</label>
                        <label><input type="radio" name="sestad_ce_p17" value="No le recetaron"> No le recetaron</label>
                        <label><input type="radio" name="sestad_ce_p17" value="Tendrá que comprar"> Tendrá que comprar</label>
                    </div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P18: Satisfacción con atención médica</label>
                    <div class="checkbox-inline-group">
                        <label><input type="radio" name="sestad_ce_p18" value="Mucho"> Mucho</label>
                        <label><input type="radio" name="sestad_ce_p18" value="Regular"> Regular</label>
                        <label><input type="radio" name="sestad_ce_p18" value="Nada"> Nada</label>
                    </div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P19: ¿Expediente clínico disponible?</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_ce_p19" value="Sí"> Sí</label><label><input type="radio" name="sestad_ce_p19" value="No"> No</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P20: ¿Enfermería fue amable?</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_ce_p20" value="Sí"> Sí</label><label><input type="radio" name="sestad_ce_p20" value="No"> No</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P21: ¿Limpieza en sala de espera adecuada?</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_ce_p21" value="Sí"> Sí</label><label><input type="radio" name="sestad_ce_p21" value="No"> No</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P22: ¿Limpieza en baños adecuada?</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_ce_p22" value="Sí"> Sí</label><label><input type="radio" name="sestad_ce_p22" value="No"> No</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>P23: ¿Satisfecho con calidad de cuidados y servicios?</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_ce_p23" value="Sí"> Sí</label><label><input type="radio" name="sestad_ce_p23" value="No"> No</label></div>
                </div>
            </div>
        `;
    } else if (area === 'Hospitalización') {
        html = `
            <div id="sestad-form-hospitalizacion" class="form-card">
                <h3 class="form-section-title"><i data-lucide="bed"></i> 3. Encuesta de Egreso (Hospitalización)</h3>
                
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>1. El personal de Relaciones Públicas fue amable y me orientó.</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_h_p1" value="Sí"> Sí</label><label><input type="radio" name="sestad_h_p1" value="No"> No</label><label><input type="radio" name="sestad_h_p1" value="No Aplica"> No Aplica</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>2. RP dio seguimiento constante a los movimientos de mi paciente.</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_h_p2" value="Sí"> Sí</label><label><input type="radio" name="sestad_h_p2" value="No"> No</label><label><input type="radio" name="sestad_h_p2" value="No Aplica"> No Aplica</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>3. En la sala de mi paciente la limpieza era adecuada.</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_h_p3" value="Sí"> Sí</label><label><input type="radio" name="sestad_h_p3" value="No"> No</label><label><input type="radio" name="sestad_h_p3" value="No Aplica"> No Aplica</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>4. La limpieza en los baños es correcta.</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_h_p4" value="Sí"> Sí</label><label><input type="radio" name="sestad_h_p4" value="No"> No</label><label><input type="radio" name="sestad_h_p4" value="No Aplica"> No Aplica</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>5. La limpieza en las salas de espera es adecuada.</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_h_p5" value="Sí"> Sí</label><label><input type="radio" name="sestad_h_p5" value="No"> No</label><label><input type="radio" name="sestad_h_p5" value="No Aplica"> No Aplica</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>6. El personal médico me indicó los cuidados en el hogar.</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_h_p6" value="Sí"> Sí</label><label><input type="radio" name="sestad_h_p6" value="No"> No</label><label><input type="radio" name="sestad_h_p6" value="No Aplica"> No Aplica</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>7. El servicio de pago en caja es eficiente y rápido.</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_h_p7" value="Sí"> Sí</label><label><input type="radio" name="sestad_h_p7" value="No"> No</label><label><input type="radio" name="sestad_h_p7" value="No Aplica"> No Aplica</label></div>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>8. Me encuentro satisfecho con la calidad de los cuidados y servicios.</label>
                    <div class="checkbox-inline-group"><label><input type="radio" name="sestad_h_p8" value="Sí"> Sí</label><label><input type="radio" name="sestad_h_p8" value="No"> No</label><label><input type="radio" name="sestad_h_p8" value="No Aplica"> No Aplica</label></div>
                </div>
            </div>
        `;
    }

    html += `
        <!-- SECCIÓN 4: Derivación a SUG y Comentarios -->
        <div class="form-card">
            <h3 class="form-section-title"><i data-lucide="message-square"></i> 4. Comentarios y Derivación a SUG</h3>
            
            <div class="form-group" style="margin-bottom: 1.5rem;">
                <label>Comentarios adicionales:</label>
                <textarea class="form-input" id="sestad-comentarios" name="comentarios_adicionales" rows="3" placeholder="Escriba los comentarios que el paciente o familiar haya expresado..."></textarea>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; background: #f8fafc; padding: 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0;">
                <div>
                    <strong style="display: block; color: #0f172a; margin-bottom: 0.25rem;">¿Se detectó alguna Queja, Sugerencia o Felicitación (QSF) durante la encuesta?</strong>
                    <span style="color: #64748b; font-size: 0.9rem;">Al marcar esta opción, se generará un registro automáticamente en el módulo SUG.</span>
                </div>
                <label class="switch-container" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                    <input type="checkbox" id="sestad-derivacion-sug" onchange="toggleSUGAlert(this)" style="width: 24px; height: 24px; accent-color: var(--primary);">
                    <span style="font-weight: 600; color: #334155;">Sí, hay QSF</span>
                </label>
            </div>
            <div id="sestad-sug-alert" class="alert-box highlight-danger hidden" style="margin-top: 1rem;">
                <div style="display:flex; gap:10px; align-items:center; font-weight:700;">
                    <i data-lucide="alert-triangle"></i> Alerta: Se derivará a SUG
                </div>
                <p style="font-size: 0.9rem; margin-top: 0.5rem; margin-left: 34px;">
                    La plataforma registrará automáticamente una "Encuesta de Calidad" en la bandeja del módulo SUG.
                </p>
            </div>
        </div>
    `;

    container.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function toggleSUGAlert(checkbox) {
    const alertBox = document.getElementById('sestad-sug-alert');
    if (checkbox.checked) {
        alertBox.classList.remove('hidden');
    } else {
        alertBox.classList.add('hidden');
    }
}

function saveSESTADForm() {
    const area = document.getElementById('sestad-area').value;
    if (!area) {
        alert("Por favor seleccione un Área de Aplicación en la Sección 1.");
        return;
    }

    const folioStr = `SES-2026-${String(encuestasLocales.length + 1).padStart(3, '0')}`;
    const fecha = document.getElementById('sestad-fecha').value || getCurrentDateFormatted();
    const aplicador = document.getElementById('sestad-aplicador').value;

    // Captura base
    const surveyData = {
        folio: folioStr,
        date: fecha,
        area: area,
        aplicador: aplicador || 'No especificado',
        status: 'Capturada',
        rawData: {
            // Seccion 2
            turno: document.querySelector('input[name="sestad-turno"]:checked')?.value || '',
            sexo: document.querySelector('input[name="sestad-sexo"]:checked')?.value || '',
            entrevistado: document.querySelector('input[name="sestad-entrevistado"]:checked')?.value || '',
            seguridad: document.getElementById('sestad-seguridad').value,
            edad: document.getElementById('sestad-edad').value,
        }
    };

    // Captura especifica
    if (area === 'Hospitalización') {
        surveyData.rawData.hGeneral = document.getElementById('sestad-h-general')?.value || '';
    } else if (area === 'Consulta Externa') {
        surveyData.rawData.procedencia = document.getElementById('sestad-ce-procedencia')?.value || '';
        surveyData.rawData.especialidad = document.getElementById('sestad-ce-especialidad')?.value || '';
        surveyData.rawData.satisfaccion = document.querySelector('input[name="sestad-ce-p18"]:checked')?.value || '';
    } else if (area === 'Urgencias') {
        surveyData.rawData.satisfaccion = document.querySelector('input[name="sestad-u-p13"]:checked')?.value || '';
    }

    encuestasLocales.push(surveyData);

    // Derivacion SUG
    const derivarSUG = document.getElementById('sestad-derivacion-sug').checked;
    if (derivarSUG) {
        const sugFolio = `ECE-2026-${String(sugerenciasLocales.filter(i => i.folio.startsWith('ECE')).length + 1).padStart(3, '0')}`;
        sugerenciasLocales.push({
            folio: sugFolio,
            date: fecha,
            medio: 'Encuestas de Calidad',
            type: 'Encuesta de Calidad',
            status: 'En Análisis',
            rawData: {
                aplicador: aplicador,
                servicio: area,
                comentarios: "Derivado automáticamente desde Módulo SESTAD."
            }
        });
        showToast(`Registro SUG ${sugFolio} generado automáticamente.`);
    }

    showSESTADDashboard();
    showToast(`Encuesta ${folioStr} guardada exitosamente.`);
}

function readSESTADReport(folio) {
    const report = encuestasLocales.find(i => i.folio === folio);
    if (!report) return;

    showView('sestad-form-view');

    document.getElementById('sestad-fecha').value = report.date.includes('/') ? report.date.split(' ')[0].split('/').reverse().join('-') : report.date;

    document.getElementById('sestad-aplicador').value = report.aplicador === 'No especificado' ? '' : report.aplicador;
    document.getElementById('sestad-area').value = report.area;
    handleSESTADAreaChange();

    // Fill Section 2
    if (report.rawData.turno) {
        const t = document.querySelector(`input[name="sestad-turno"][value="${report.rawData.turno}"]`);
        if (t) t.checked = true;
    }
    if (report.rawData.sexo) {
        const s = document.querySelector(`input[name="sestad-sexo"][value="${report.rawData.sexo}"]`);
        if (s) s.checked = true;
    }
    if (report.rawData.entrevistado) {
        const e = document.querySelector(`input[name="sestad-entrevistado"][value="${report.rawData.entrevistado}"]`);
        if (e) e.checked = true;
    }
    document.getElementById('sestad-seguridad').value = report.rawData.seguridad;
    document.getElementById('sestad-edad').value = report.rawData.edad;

    // Fill Section 3 specific fields if any were saved completely
    if (report.area === 'Hospitalización' && report.rawData.hGeneral) {
        document.getElementById('sestad-h-general').value = report.rawData.hGeneral;
    } else if (report.area === 'Consulta Externa') {
        document.getElementById('sestad-ce-procedencia').value = report.rawData.procedencia;
        document.getElementById('sestad-ce-especialidad').value = report.rawData.especialidad;
        if (report.rawData.satisfaccion) {
            const el = document.querySelector(`input[name="sestad-ce-p18"][value="${report.rawData.satisfaccion}"]`);
            if (el) el.checked = true;
        }
    } else if (report.area === 'Urgencias') {
        if (report.rawData.satisfaccion) {
            const el = document.querySelector(`input[name="sestad-u-p13"][value="${report.rawData.satisfaccion}"]`);
            if (el) el.checked = true;
        }
    }

    // Disable all inputs
    const formInputs = document.getElementById('sestad-form').querySelectorAll('input, select, textarea');
    formInputs.forEach(el => el.disabled = true);

    document.getElementById('btn-save-sestad').style.display = 'none';
    document.getElementById('sestad-sug-alert').classList.add('hidden');
}

function viewReportDetail(module, report) {
    document.getElementById('detail-folio').textContent = `Folio: ${report.folio}`;
    document.getElementById('detail-date').textContent = `Fecha de Registro: ${report.date}`;

    const badge = document.getElementById('detail-status-badge');
    badge.textContent = report.status || report.type;
    badge.className = `status-badge badge-${report.class || 'nearmiss'}`;

    const contentDiv = document.getElementById('detail-content');
    contentDiv.innerHTML = '';

    // Generate specific fields based on module
    let fields = [];
    if (module === 'SREA') {
        fields = [
            { label: 'Tipo de Incidente', value: report.type },
            { label: 'Servicio / Área', value: report.area },
            { label: 'Paciente Involucrado', value: 'Simulado Anónimo (Exp: 002341)' },
            { label: 'Nivel de Riesgo', value: report.class === 'sentinel' ? 'Alto (Centinela)' : (report.class === 'adverse' ? 'Medio (Adverso)' : 'Bajo (Cuasifalla)') }
        ];
        document.getElementById('detail-notes').textContent = 'Se completó el registro en la base de datos SQL de la plataforma y se adjuntó la evidencia PDF (formato_MP-6001).';
        document.getElementById('btn-back-detail').onclick = () => showView('srea-dashboard');
    } else if (module === 'SUG') {
        fields = [
            { label: 'Tipo de Documento', value: report.type },
            { label: 'Medio de Ingreso', value: report.medio },
            { label: 'Área Relacionada', value: 'Atención Ciudadana y Calidad' },
            { label: 'Canalizado por', value: 'Servicio de Calidad' }
        ];
        document.getElementById('detail-notes').textContent = 'Se dio seguimiento a través de Oficio interno y se registró la resolución en la Base de Datos de la Plataforma y plataforma institucional.';
        document.getElementById('btn-back-detail').onclick = () => showView('sug-dashboard');
    } else if (module === 'SESTAD') {
        fields = [
            { label: 'Área Evaluada', value: report.area },
            { label: 'Aplicador de Encuesta', value: report.aplicador },
            { label: 'Satisfacción Global', value: '94% (Aprobatorio)' },
            { label: 'Notas de DGCES', value: 'Formatos tabulados y enviados a estadística en SPSS.' }
        ];
        document.getElementById('detail-notes').textContent = 'No se detectaron Quejas, Sugerencias o Felicitaciones explícitas en este formato particular. Capturado con éxito en las plataformas correspondientes.';
        document.getElementById('btn-back-detail').onclick = () => showView('sestad-dashboard');
    }

    fields.forEach(f => {
        contentDiv.innerHTML += `
            <div>
                <label style="font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase;">${f.label}</label>
                <div style="margin-top: 0.4rem; padding: 0.8rem; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.95rem; color: #0f172a;">
                    ${f.value}
                </div>
            </div>
        `;
    });

    showView('report-detail-view');
}

// ======================= MECIC Logic =======================

function showMECICDashboard() {
    showView('mecic-dashboard');
}

function startMECICProcess() {
    // Reset Views/Icons
    document.getElementById('mecic-step1-icon').style.background = 'var(--primary)';
    document.getElementById('mecic-step1-icon').innerHTML = '1';
    document.getElementById('mecic-step1-icon').style.borderColor = '#fff';
    document.getElementById('mecic-step1-icon').style.boxShadow = '0 0 0 2px var(--primary)';
    document.getElementById('mecic-step1-text').style.color = 'var(--primary)';

    document.getElementById('mecic-step2-icon').style.background = '#f1f5f9';
    document.getElementById('mecic-step2-icon').innerHTML = '2';
    document.getElementById('mecic-step2-icon').style.borderColor = '#e2e8f0';
    document.getElementById('mecic-step2-icon').style.boxShadow = 'none';
    document.getElementById('mecic-step2-icon').style.color = '#94a3b8';
    document.getElementById('mecic-step2-text').style.color = '#94a3b8';
    document.getElementById('mecic-step2-text').style.fontWeight = '500';

    document.getElementById('mecic-step3-icon').style.background = '#f1f5f9';
    document.getElementById('mecic-step3-icon').innerHTML = '3';
    document.getElementById('mecic-step3-icon').style.borderColor = '#e2e8f0';
    document.getElementById('mecic-step3-icon').style.boxShadow = 'none';
    document.getElementById('mecic-step3-icon').style.color = '#94a3b8';
    document.getElementById('mecic-step3-text').style.color = '#94a3b8';
    document.getElementById('mecic-step3-text').style.fontWeight = '500';

    document.getElementById('mecic-form-step1').classList.remove('hidden');
    document.getElementById('mecic-form-step2').classList.add('hidden');
    document.getElementById('mecic-form-step3').classList.add('hidden');

    document.getElementById('mecic-visual-icon').innerHTML = '<i data-lucide="users" size="64" style="color: var(--primary);"></i>';
    document.getElementById('mecic-visual-title').innerText = 'Comité Evaluador';

    showView('mecic-process-view');
    lucide.createIcons();
}

function mecicMoveToStep2() {
    document.getElementById('mecic-step1-icon').style.background = '#10b981';
    document.getElementById('mecic-step1-icon').innerHTML = '<i data-lucide="check" size="16"></i>';
    document.getElementById('mecic-step1-icon').style.borderColor = '#10b981';
    document.getElementById('mecic-step1-icon').style.boxShadow = 'none';
    document.getElementById('mecic-step1-text').style.color = '#10b981';

    document.getElementById('mecic-step2-icon').style.background = 'var(--primary)';
    document.getElementById('mecic-step2-icon').style.borderColor = '#fff';
    document.getElementById('mecic-step2-icon').style.boxShadow = '0 0 0 2px var(--primary)';
    document.getElementById('mecic-step2-icon').style.color = 'white';
    document.getElementById('mecic-step2-icon').style.fontWeight = '700';
    document.getElementById('mecic-step2-text').style.color = 'var(--primary)';
    document.getElementById('mecic-step2-text').style.fontWeight = '700';

    document.getElementById('mecic-form-step1').classList.add('hidden');
    document.getElementById('mecic-form-step2').classList.remove('hidden');

    document.getElementById('mecic-visual-icon').innerHTML = '<i data-lucide="file-spreadsheet" size="64" style="color: #10b981;"></i>';
    document.getElementById('mecic-visual-title').innerText = 'Validación Excel';

    lucide.createIcons();
}

function mecicMoveToStep3() {
    document.getElementById('mecic-step2-icon').style.background = '#10b981';
    document.getElementById('mecic-step2-icon').innerHTML = '<i data-lucide="check" size="16"></i>';
    document.getElementById('mecic-step2-icon').style.borderColor = '#10b981';
    document.getElementById('mecic-step2-icon').style.boxShadow = 'none';
    document.getElementById('mecic-step2-text').style.color = '#10b981';

    document.getElementById('mecic-step3-icon').style.background = 'var(--primary)';
    document.getElementById('mecic-step3-icon').style.borderColor = '#fff';
    document.getElementById('mecic-step3-icon').style.boxShadow = '0 0 0 2px var(--primary)';
    document.getElementById('mecic-step3-icon').style.color = 'white';
    document.getElementById('mecic-step3-icon').style.fontWeight = '700';
    document.getElementById('mecic-step3-text').style.color = 'var(--primary)';
    document.getElementById('mecic-step3-text').style.fontWeight = '700';

    document.getElementById('mecic-form-step2').classList.add('hidden');
    document.getElementById('mecic-form-step3').classList.remove('hidden');

    document.getElementById('mecic-visual-icon').innerHTML = '<i data-lucide="upload-cloud" size="64" style="color: var(--secondary);"></i>';
    document.getElementById('mecic-visual-title').innerText = 'DGCES e Informes';

    lucide.createIcons();
}

function finishMECICProcess() {
    alert("Proceso de MECIC completado correctamente y registrado.");
    showView('mecic-dashboard');
}

// ======================= INDICAS Logic =======================

function showINDICAsDashboard() {
    showView('indicas-dashboard');
}

function startINDICASProcess() {
    // Reset Views/Icons
    document.getElementById('indicas-step1-icon').style.background = 'var(--primary)';
    document.getElementById('indicas-step1-icon').innerHTML = '1';
    document.getElementById('indicas-step1-icon').style.borderColor = '#fff';
    document.getElementById('indicas-step1-icon').style.boxShadow = '0 0 0 2px var(--primary)';
    document.getElementById('indicas-step1-text').style.color = 'var(--primary)';

    document.getElementById('indicas-step2-icon').style.background = '#f1f5f9';
    document.getElementById('indicas-step2-icon').innerHTML = '2';
    document.getElementById('indicas-step2-icon').style.borderColor = '#e2e8f0';
    document.getElementById('indicas-step2-icon').style.boxShadow = 'none';
    document.getElementById('indicas-step2-icon').style.color = '#94a3b8';
    document.getElementById('indicas-step2-text').style.color = '#94a3b8';
    document.getElementById('indicas-step2-text').style.fontWeight = '500';

    document.getElementById('indicas-step3-icon').style.background = '#f1f5f9';
    document.getElementById('indicas-step3-icon').innerHTML = '3';
    document.getElementById('indicas-step3-icon').style.borderColor = '#e2e8f0';
    document.getElementById('indicas-step3-icon').style.boxShadow = 'none';
    document.getElementById('indicas-step3-icon').style.color = '#94a3b8';
    document.getElementById('indicas-step3-text').style.color = '#94a3b8';
    document.getElementById('indicas-step3-text').style.fontWeight = '500';

    document.getElementById('indicas-form-step1').classList.remove('hidden');
    document.getElementById('indicas-form-step2').classList.add('hidden');
    document.getElementById('indicas-form-step3').classList.add('hidden');

    document.getElementById('indicas-visual-icon').innerHTML = '<i data-lucide="clipboard-list" size="64" style="color: var(--primary);"></i>';
    document.getElementById('indicas-visual-title').innerText = 'Módulo de Captura';

    showView('indicas-process-view');
    lucide.createIcons();
}

function indicasMoveToStep2() {
    document.getElementById('indicas-step1-icon').style.background = '#10b981';
    document.getElementById('indicas-step1-icon').innerHTML = '<i data-lucide="check" size="16"></i>';
    document.getElementById('indicas-step1-icon').style.borderColor = '#10b981';
    document.getElementById('indicas-step1-icon').style.boxShadow = 'none';
    document.getElementById('indicas-step1-text').style.color = '#10b981';

    document.getElementById('indicas-step2-icon').style.background = 'var(--primary)';
    document.getElementById('indicas-step2-icon').style.borderColor = '#fff';
    document.getElementById('indicas-step2-icon').style.boxShadow = '0 0 0 2px var(--primary)';
    document.getElementById('indicas-step2-icon').style.color = 'white';
    document.getElementById('indicas-step2-icon').style.fontWeight = '700';
    document.getElementById('indicas-step2-text').style.color = 'var(--primary)';
    document.getElementById('indicas-step2-text').style.fontWeight = '700';

    document.getElementById('indicas-form-step1').classList.add('hidden');
    document.getElementById('indicas-form-step2').classList.remove('hidden');

    document.getElementById('indicas-visual-icon').innerHTML = '<i data-lucide="book-open" size="64" style="color: #f59e0b;"></i>';
    document.getElementById('indicas-visual-title').innerText = 'Cuadernillo Físico/Digital';

    lucide.createIcons();
}

function indicasMoveToStep3() {
    document.getElementById('indicas-step2-icon').style.background = '#10b981';
    document.getElementById('indicas-step2-icon').innerHTML = '<i data-lucide="check" size="16"></i>';
    document.getElementById('indicas-step2-icon').style.borderColor = '#10b981';
    document.getElementById('indicas-step2-icon').style.boxShadow = 'none';
    document.getElementById('indicas-step2-text').style.color = '#10b981';

    document.getElementById('indicas-step3-icon').style.background = 'var(--primary)';
    document.getElementById('indicas-step3-icon').style.borderColor = '#fff';
    document.getElementById('indicas-step3-icon').style.boxShadow = '0 0 0 2px var(--primary)';
    document.getElementById('indicas-step3-icon').style.color = 'white';
    document.getElementById('indicas-step3-icon').style.fontWeight = '700';
    document.getElementById('indicas-step3-text').style.color = 'var(--primary)';
    document.getElementById('indicas-step3-text').style.fontWeight = '700';

    document.getElementById('indicas-form-step2').classList.add('hidden');
    document.getElementById('indicas-form-step3').classList.remove('hidden');

    document.getElementById('indicas-visual-icon').innerHTML = '<i data-lucide="monitor" size="64" style="color: var(--secondary);"></i>';
    document.getElementById('indicas-visual-title').innerText = 'INDICAS II DGCES';

    lucide.createIcons();
}

function finishINDICASProcess() {
    alert("Captura de INDICAS II completada correctamente.");
    showView('indicas-dashboard');
}

// ==========================================================

document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const usuario = this.querySelector('input[type="text"]').value;
    const password = this.querySelector('input[type="password"]').value;
    const errorMsg = document.getElementById('login-error');
    const btn = this.querySelector('button');

    errorMsg.classList.remove('error-active');

    if (usuario === 'Administrador' && password === '1234') {
        btn.innerText = 'Iniciando sesión...';
        btn.style.opacity = '0.7';
        btn.disabled = true;

        setTimeout(() => {
            const loginView = document.getElementById('login-view');
            const dashboardView = document.getElementById('dashboard-view');

            loginView.style.opacity = '0';

            setTimeout(() => {
                loginView.classList.add('hidden');
                dashboardView.classList.remove('hidden');
                dashboardView.style.opacity = '0';

                showView('main-view');

                setTimeout(() => {
                    dashboardView.style.opacity = '1';
                    dashboardView.style.transition = 'opacity 0.8s ease';
                }, 50);
            }, 400);
        }, 800);
    } else {
        errorMsg.classList.add('error-active');
        const card = document.querySelector('.login-card');
        card.style.animation = 'none';
        card.offsetHeight;
        card.style.animation = 'shake 0.4s ease-in-out';
    }
});

document.getElementById('logout-btn')?.addEventListener('click', function () {
    location.reload();
});

// ==========================================================
// SREA Stepper Logic
let currentSreaStep = 1;
const totalSreaSteps = 8;

function updateSreaStepper() {
    document.querySelectorAll('#srea-form .wizard-step').forEach(step => {
        step.classList.remove('active');
    });

    const currentStepEl = document.querySelector(`#srea-form .wizard-step[data-step="${currentSreaStep}"]`);
    if (currentStepEl) {
        currentStepEl.classList.add('active');
    }

    document.querySelectorAll('#srea-form .step-item').forEach(item => {
        const stepNum = parseInt(item.getAttribute('data-step'));
        if (stepNum <= currentSreaStep) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    const backBtn = document.querySelector('#srea-form .wizard-nav .btn-back');
    const nextBtn = document.querySelector('#srea-form .wizard-nav .btn-primary');

    if (!backBtn || !nextBtn) return;

    if (currentSreaStep === 1) {
        backBtn.style.visibility = 'hidden';
    } else {
        backBtn.style.visibility = 'visible';
    }

    if (currentSreaStep === totalSreaSteps) {
        nextBtn.innerHTML = '<i data-lucide="save" size="18"></i> Guardar Formulario';
        nextBtn.onclick = function() {
            if (typeof saveSREAForm === 'function') {
                saveSREAForm();
            } else {
                alert('Formulario guardado.');
                showView('srea-dashboard');
                currentSreaStep = 1;
                updateSreaStepper();
            }
        };
    } else {
        nextBtn.innerHTML = 'Siguiente <i data-lucide="arrow-right" size="18"></i>';
        nextBtn.onclick = nextStep;
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function nextStep() {
    if (currentSreaStep < totalSreaSteps) {
        currentSreaStep++;
        updateSreaStepper();
    }
}

function prevStep() {
    if (currentSreaStep > 1) {
        currentSreaStep--;
        updateSreaStepper();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateSreaStepper();
});

// ==========================================================
// SESTAD Consulta Externa Logic
let currentSestadStep = 1;
const totalSestadSteps = 5;

function showSESTADConsultaExterna() {
    showView('sestad-form-consulta-view');
    currentSestadStep = 1;
    updateSestadStepper();
}

function updateSestadStepper() {
    document.querySelectorAll('#sestad-consulta-form .wizard-step-sestad').forEach(step => {
        step.classList.remove('active');
        step.style.display = 'none';
    });

    const currentStepEl = document.querySelector(`#sestad-consulta-form .wizard-step-sestad[data-step="${currentSestadStep}"]`);
    if (currentStepEl) {
        currentStepEl.classList.add('active');
        currentStepEl.style.display = 'block';
    }

    document.querySelectorAll('#sestad-consulta-form .step-item').forEach(item => {
        const stepNum = parseInt(item.getAttribute('data-step'));
        if (stepNum <= currentSestadStep) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    const backBtn = document.querySelector('#sestad-consulta-form .sestad-back-btn');
    const nextBtn = document.querySelector('#sestad-consulta-form .sestad-next-btn');

    if (!backBtn || !nextBtn) return;

    if (currentSestadStep === 1) {
        backBtn.style.visibility = 'hidden';
    } else {
        backBtn.style.visibility = 'visible';
    }

    if (currentSestadStep === totalSestadSteps) {
        nextBtn.innerHTML = '<i data-lucide="save" size="18"></i> Guardar Encuesta';
        nextBtn.onclick = function() {
            alert('Encuesta SESTAD Consulta Externa guardada exitosamente.');
            showView('dashboard-view');
            currentSestadStep = 1;
            updateSestadStepper();
        };
    } else {
        nextBtn.innerHTML = 'Siguiente <i data-lucide="arrow-right" size="18"></i>';
        nextBtn.onclick = nextSestadStep;
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function nextSestadStep() {
    if (currentSestadStep < totalSestadSteps) {
        currentSestadStep++;
        updateSestadStepper();
    }
}

function prevSestadStep() {
    if (currentSestadStep > 1) {
        currentSestadStep--;
        updateSestadStepper();
    }
}

function togglePersonalRespeto(show) {
    const container = document.getElementById('sestad-q2-container');
    if (show) {
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
        container.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    }
}

function toggleAtencionDolor(show) {
    const container = document.getElementById('sestad-q16-container');
    if (show) {
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
        container.querySelectorAll('input[type="radio"]').forEach(rb => rb.checked = false);
    }
}
