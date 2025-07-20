const fileInput = document.getElementById('pdfUpload');
const fileList = document.getElementById('fileList');
const mergeButton = document.querySelector('.btn-success');
mergeButton.disabled = true;

function showToast(message, type = 'primary') {
    const toastEl = document.getElementById('toastMessage');
    const toastBody = toastEl.querySelector('.toast-body');

    toastBody.textContent = message;
    toastEl.className = `toast align-items-center text-bg-${type} border-0`;

    const toast = new bootstrap.Toast(toastEl, {
        delay: 5000
    });
    toast.show();
}

const downloadPDF = (pdfBytes, fileName) => {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
}

const mergePDFs = async () => {
    if (fileInput.files.length === 0) {
        showToast('Please select PDF files to merge', 'warning');
        return;
    }
    
    const mergedPdf = await PDFLib.PDFDocument.create();

    for (const file of fileInput.files) {
        if (file.type !== "application/pdf") {
            showToast(`Invalid file type: "${file.type}". Please upload only PDF files`, 'warning');
            return;
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    downloadPDF(mergedPdfBytes, 'merged.pdf');
    showToast('PDF merged successfully!', 'success');

    fileInput.value = "";
    fileList.innerHTML = "";
    fileList.classList.add("d-none");
    mergeButton.disabled = true;
}

const displayFileList = () => {
    fileList.innerHTML = "";
    mergeButton.disabled = true;
    
    if (fileInput.files.length === 0) {
        fileList.classList.add("d-none");
        return;
    }

    fileList.classList.remove("d-none");
    fileList.classList.add("d-block");
    let hasValidFiles = false;

    for (const file of fileInput.files) {
        if (file.type !== "application/pdf") {
            showToast(`Invalid file type: "${file.type}". Please upload only PDF files`, 'warning');
            fileInput.value = "";
            fileList.innerHTML = "";
            mergeButton.disabled = true;
            return;
        }
        hasValidFiles = true;

        const listItem = document.createElement('li');
        listItem.className = "list-group-item d-flex justify-content-between align-items-center";
        listItem.textContent = file.name;

        const fileSize = document.createElement('span');
        fileSize.className = "badge bg-primary rounded-pill";
        fileSize.textContent = `${(file.size / 1024).toFixed(2)} KB`;
        
        listItem.appendChild(fileSize);
        fileList.appendChild(listItem);
    }
    mergeButton.disabled = !hasValidFiles;
}

fileInput.addEventListener('change', displayFileList);
