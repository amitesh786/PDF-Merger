function displayFileList() {
    const fileInput = document.getElementById('pdfUpload');
    const fileList = document.getElementById('fileList');
    
    fileList.innerHTML = "";
    if (fileInput.files.length === 0) {
        return;
    }

    for (const file of fileInput.files) {
        if (file.type !== "application/pdf") {
            alert(`Invalid file: "${file.name}". Please upload only PDF files.`);
            fileInput.value = "";
            fileList.innerHTML = "";
            return;
        }
        fileList.classList.remove("d-none");
        fileList.classList.add("d-block");
        const listItem = document.createElement('li');
        listItem.className = "list-group-item d-flex justify-content-between align-items-center";
        listItem.textContent = file.name;

        const fileSize = document.createElement('span');
        fileSize.className = "badge bg-primary rounded-pill";
        fileSize.textContent = `${(file.size / 1024).toFixed(2)} KB`;
        
        listItem.appendChild(fileSize);
        fileList.appendChild(listItem);
    }
}

async function mergePDFs() {
    const fileInput = document.getElementById('pdfUpload');
    
    if (fileInput.files.length === 0) {
        alert('Please select PDF files to merge.');
        return;
    }
    
    const mergedPdf = await PDFLib.PDFDocument.create();

    for (const file of fileInput.files) {
        if (file.type !== "application/pdf") {
            alert(`Invalid file: "${file.name}". Please upload only PDF files.`);
            return;
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    downloadPDF(mergedPdfBytes, 'merged.pdf');

    fileInput.value = "";
    fileList.innerHTML = "";
    fileList.classList.add("d-none");
}

function downloadPDF(pdfBytes, fileName) {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
}
