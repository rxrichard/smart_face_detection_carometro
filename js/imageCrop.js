const maxSize = 400; // Aumentei um pouco para melhorar a precisão da detecção
const BATCH_SIZE = 5; // Processa 5 imagens por vez

// Remove arquivos anteriores do array
function getImageArray(inputFiles, array) {
    array.splice(0, array.length);
    if (inputFiles.length != 0) {
        for (let i = 0; i < inputFiles.length; i++) {
            if (inputFiles[i].type.match(/image\/(jpeg|png|webp)/))
                array.push(inputFiles[i]);
        }
    }
}

// Pausa para não travar a tela
const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));

// 1. Reduz a imagem para processamento (Cria uma versão leve para a IA ler)
async function reduceImage(image, maxSize) {
    try {
        const name = image.name || image.id;
        const bitmap = await createImageBitmap(image);
        
        const bitmapWidth = bitmap.width;
        const bitmapHeight = bitmap.height;
        
        // Calcula escala para reduzir (mantendo proporção)
        const scale = Math.min(maxSize / bitmapWidth, maxSize / bitmapHeight);
        
        const canvas = document.createElement("canvas");
        canvas.width = bitmapWidth * scale;
        canvas.height = bitmapHeight * scale;
        
        const ctx = canvas.getContext("2d", { alpha: false });
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        
        // Fator de escala: Original dividido por Reduzida
        // Ex: Se original é 2000px e reduzida é 200px, returnScale é 10.
        const returnScale = bitmapWidth / canvas.width;
        
        const blob = await new Promise(resolve => ctx.canvas.toBlob(resolve, "image/jpeg", 0.9));
        const newFile = new File([blob], "cropped_" + name, { type: blob.type });
        
        bitmap.close();
        
        return { fileCrop: newFile, scale: returnScale, width: canvas.width, height: canvas.height };
    } catch (e) {
        console.error("Erro ao reduzir:", e);
        return null;
    }
}

// 2. Detecta o rosto na imagem reduzida
async function faceDetect(imageBlob) {
    try {
        // Precisamos criar um elemento HTML Image para o plugin jQuery funcionar bem
        const img = new Image();
        img.src = URL.createObjectURL(imageBlob);
        await new Promise(r => img.onload = r);

        // Desenha em um canvas limpo para detecção
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const faces = await new Promise(resolve => {
            $(canvas).faceDetection({
                interval: 4,
                minNeighbors: 1,
                complete: function (faces) { resolve(faces); },
                error: function () { resolve([]); }
            });
        });
        
        return faces || [];
    } catch (e) {
        console.warn("Falha na detecção facial:", e);
        return [];
    }
}

// Função Auxiliar: Processamento em Lotes
async function processInBatches(array, progress, progressText, processFunction) {
    progress.max = array.length;
    let processedCount = 0;

    for (let i = 0; i < array.length; i += BATCH_SIZE) {
        const batch = array.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (item, index) => {
            await processFunction(item, i + index);
        }));

        processedCount += batch.length;
        const currentVal = Math.min(processedCount, array.length);
        progress.value = currentVal;
        if (progressText) progressText.innerText = Math.round((currentVal / array.length) * 100) + "%";
        
        await nextFrame(); // Libera a UI
    }
}

// --- FUNÇÕES PRINCIPAIS CHAMADAS PELO HTML ---

async function reduceArrayImages(array, progress, progressText) {
    await processInBatches(array, progress, progressText, async (item, index) => {
        const result = await reduceImage(item, maxSize);
        if (result) {
            array[index] = { fileOriginal: array[index], ...result };
        } else {
            array[index] = { fileOriginal: array[index], error: true };
        }
    });
}

async function faceDetectArray(array, progress, progressText) {
    await processInBatches(array, progress, progressText, async (item, index) => {
        if (item.error) return;
        // Detecta rosto na imagem PEQUENA (fileCrop)
        const faces = await faceDetect(item.fileCrop);
        item.face = faces; 
    });
}

async function drawImages(array, progress, progressText, onImageReady) {
    await processInBatches(array, progress, progressText, async (item, index) => {
        if (item.error) return;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const ratio = item.scale; // A relação de tamanho entre a pequena e a original

        try {
            let sourceX, sourceY, sourceSize;

            // LÓGICA DE CORTE INTELIGENTE
            if (item.face && item.face.length > 0) {
                // Pega o maior rosto encontrado
                const face = item.face.sort((a, b) => b.width - a.width)[0];

                // 1. Acha o centro do rosto na imagem ORIGINAL
                const faceCenterX = (face.x + (face.width / 2)) * ratio;
                const faceCenterY = (face.y + (face.height / 2)) * ratio;
                
                // 2. Define o tamanho do recorte. 
                // Multiplicamos a largura do rosto por 2.2 para pegar ombros e cabelo
                sourceSize = (face.width * ratio) * 2.2;

                // 3. Calcula o ponto inicial (X, Y) para centralizar o recorte no rosto
                sourceX = faceCenterX - (sourceSize / 2);
                sourceY = faceCenterY - (sourceSize / 2);

            } else {
                // FALLBACK: Se não achar rosto, recorta o centro da imagem
                const originalBitmap = await createImageBitmap(item.fileOriginal);
                const minDim = Math.min(originalBitmap.width, originalBitmap.height);
                sourceSize = minDim;
                sourceX = (originalBitmap.width - minDim) / 2;
                sourceY = (originalBitmap.height - minDim) / 2;
                originalBitmap.close(); // Limpa memória
            }

            // Configura o Canvas final (Quadrado)
            // Limitamos a 500px para não ficar pesado no PDF, mas com boa qualidade
            const finalSize = 500; 
            canvas.width = finalSize;
            canvas.height = finalSize;

            // Desenha a imagem original recortada no canvas quadrado
            // drawImage(imagem, x_corte, y_corte, w_corte, h_corte, x_canvas, y_canvas, w_canvas, h_canvas)
            const fullBitmap = await createImageBitmap(item.fileOriginal);
            
            ctx.drawImage(
                fullBitmap, 
                sourceX, sourceY, sourceSize, sourceSize, // Área de corte na original
                0, 0, finalSize, finalSize // Área no canvas final
            );
            
            fullBitmap.close();

            // Salva o resultado final
            const blob = await new Promise(resolve => ctx.canvas.toBlob(resolve, "image/png"));
            
            // Atualiza o item do array para o HTML ler
            item.fileCrop = new File([blob], item.fileOriginal.name.replace(/\.[^/.]+$/, ".png"), { type: "image/png" });
            item.width = finalSize;
            item.height = finalSize;

            // Mostra na tela
            if (onImageReady) onImageReady(item);

        } catch (err) {
            console.error("Erro ao recortar imagem " + index, err);
        }
    });
}