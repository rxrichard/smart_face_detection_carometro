🇬🇧 English Version
Smart Face Directory Generator (Carômetro)
A fast, client-side web application that automatically generates printable photo directories (Carômetros) for schools, companies, or organizations. It uses JavaScript and the HTML5 Canvas API to detect faces, crop them into perfect circles, and arrange them into a print-ready A4 layout.

🚀 Key Features
100% Client-Side Processing: All image processing happens in your browser. No photos are uploaded to any server, ensuring total data privacy.

AI Face Detection: utilizes jquery.facedetection to automatically find faces within photos.

Smart Circular Cropping: Automatically centers and crops detected faces into a uniform circular format (Head & Shoulders style).

Batch Processing: Optimized performance to handle multiple photos simultaneously without freezing the browser.

Print-Ready: Automatically paginates results into A4 size with a clean layout, ready to be printed or saved as PDF.

Customizable: Choose the number of columns (photos per row) and set a custom title.

🛠️ Technologies Used
HTML5 & CSS3 (Responsive Card UI)

JavaScript (ES6+)

jQuery

jQuery Face Detection Plugin

HTML5 Canvas API (for image manipulation)

📦 How to Use
Clone the repository.

Ensure the js folder contains jquery.js, jquery.facedetection.min.js, and imageCrop.js.

Open index.html in any modern web browser.

Select your images, choose the number of columns, and click "Generate".

Once finished, use the floating button to Print or Save as PDF.

🇧🇷 Versão em Português
Gerador de Carômetro Automático
Uma aplicação web rápida e moderna que gera carômetros (diretórios de fotos) prontos para impressão para escolas, cursos ou empresas. O sistema utiliza JavaScript e a API Canvas do HTML5 para detectar rostos, recortá-los automaticamente em círculos e organizá-los em um layout A4 padronizado.

🚀 Funcionalidades Principais
Processamento 100% Local: Todo o processamento é feito no navegador do usuário. Nenhuma foto é enviada para servidores externos, garantindo total privacidade (LGPD friendly).

Detecção Facial: Utiliza a biblioteca jquery.facedetection para localizar rostos nas imagens automaticamente.

Recorte Inteligente: Centraliza o rosto detectado e aplica um recorte circular padronizado (estilo 3x4 redondo).

Processamento em Lotes: Código otimizado para processar várias imagens simultaneamente sem travar a interface.

Pronto para Imprimir: Paginação automática em formato A4, pronta para impressão ou para salvar como PDF.

Customizável: Permite escolher a quantidade de colunas por linha e definir o título do documento.

🛠️ Tecnologias Utilizadas
HTML5 & CSS3 (Interface moderna em estilo Card)

JavaScript (ES6+)

jQuery

jQuery Face Detection Plugin

HTML5 Canvas API (para manipulação de imagem)

📦 Como Usar
Clone este repositório.

Certifique-se de que a pasta js contém os arquivos jquery.js, jquery.facedetection.min.js e imageCrop.js.

Abra o arquivo index.html em qualquer navegador moderno.

Selecione as fotos dos alunos/funcionários, defina o número de colunas e clique em "Gerar Carômetro".

Ao finalizar, utilize o botão flutuante para Imprimir ou Salvar como PDF.
