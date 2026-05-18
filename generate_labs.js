const fs = require('fs');
const path = require('path');

const labsData = [
    {
        id: 1,
        title: "Lab 1",
        items: [
            { name: "lab1-3.html", path: "Lab01/lab1-3.html" },
            { name: "lab1_4.html", path: "Lab01/lab1_4.html" }
        ]
    },
    {
        id: 2,
        title: "Lab 2",
        items: [
            { name: "lab2-1.html", path: "Lab02/lab2-1.html" },
            { name: "lab2-2.html", path: "Lab02/lab2-2.html" },
            { name: "lab2-3.html", path: "Lab02/lab2-3.html" }
        ]
    },
    {
        id: 3,
        title: "Lab 3",
        items: [
            { name: "Bài 1", path: "Lab03/bai1.html" },
            { name: "Bài 2", path: "Lab03/bai2.html" },
            { name: "Bài 3", path: "Lab03/bai3.html" }
        ]
    },
    {
        id: 4,
        title: "Lab 4",
        items: [
            { name: "Bài 1", path: "Lab04/bai1.html" },
            { name: "Bài 2", path: "Lab04/bai2.html" },
            { name: "Bài 3", path: "Lab04/bai3.html" }
        ]
    },
    {
        id: 5,
        title: "Lab 5",
        items: [
            { name: "lab menu.html", path: "Lab05/lab_menu.html" },
            { name: "bai2 / index.html", path: "Lab05/bai2/index.html" }
        ]
    },
    {
        id: 6,
        title: "Lab 6",
        items: [
            { name: "lab responsive.html", path: "Lab06/lab_responsive.html" },
            { name: "index.html", path: "Lab06/index.html" },
            { name: "index1.html", path: "Lab06/index1.html" }
        ]
    },
    {
        id: 7,
        title: "Lab 7",
        items: [
            { name: "vi du / index.html", path: "Lab07/vi_du/index.html" },
            { name: "demobai2 / index.html", path: "Lab07/demobai2/index.html" }
        ]
    },
    {
        id: 8,
        title: "Lab 8",
        items: [
            { name: "slider.html", path: "Lab08/slider.html" },
            { name: "slider auto.html", path: "Lab08/slider_auto.html" },
            { name: "index.html", path: "Lab08/index.html" }
        ]
    }
];

const headerHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Báo Cáo {LAB_TITLE} - BookHaven</title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../assets/css/style.css">
    
    <style>
        .lab-page {
            display: flex;
            min-height: calc(100vh - 80px); /* Minus header */
            background-color: var(--bg-alt);
        }
        .lab-sidebar {
            width: 280px;
            background-color: var(--bg-main);
            border-right: 1px solid var(--border-color);
            padding: 30px 20px;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .lab-sidebar h2 {
            font-size: 1.5rem;
            color: var(--primary-color);
            margin-bottom: 10px;
            font-family: var(--font-heading);
            border-bottom: 2px solid var(--secondary-color);
            padding-bottom: 10px;
        }
        .lab-list {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .lab-list li a {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 15px;
            background-color: var(--bg-alt);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            font-weight: 500;
            color: var(--text-main);
            transition: all 0.3s ease;
        }
        .lab-list li a:hover, .lab-list li a.active {
            background-color: var(--primary-color);
            color: var(--bg-alt);
            border-color: var(--primary-color);
        }
        .lab-list li a i {
            color: var(--secondary-color);
        }
        .lab-list li a.active i {
            color: var(--bg-alt);
        }
        .lab-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 20px;
        }
        .lab-title-bar {
            background-color: var(--primary-color);
            color: var(--bg-alt);
            padding: 15px 25px;
            border-radius: var(--radius-md) var(--radius-md) 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .lab-title-bar h3 {
            font-family: var(--font-heading);
            font-size: 1.2rem;
            margin: 0;
        }
        .lab-title-bar a {
            color: var(--bg-alt);
            font-size: 0.9rem;
            text-decoration: underline;
            transition: color 0.3s;
        }
        .lab-title-bar a:hover {
            color: var(--secondary-color);
        }
        .lab-iframe-container {
            flex: 1;
            background-color: white;
            border: 1px solid var(--border-color);
            border-top: none;
            border-radius: 0 0 var(--radius-md) var(--radius-md);
            overflow: hidden;
        }
        iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
        .back-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: var(--text-muted);
            margin-bottom: 20px;
            font-weight: 500;
        }
        .back-btn:hover {
            color: var(--primary-color);
        }
    </style>
</head>
<body>

    <!-- Header Section -->
    <header class="header">
        <div class="container header-container">
            <a href="../index.html" class="logo">
                <img src="../assets/images/logo/logo.png" alt="BookHaven Logo" style="height: 50px;">
            </a>
            <nav class="nav-menu">
                <ul class="nav-links">
                    <li><a href="../index.html">Trang chủ</a></li>
                    <li><a href="../products.html">Cửa hàng</a></li>
                    <li><a href="../labs.html" class="active">Báo cáo Lab</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <div class="lab-page">
        <!-- Sidebar -->
        <aside class="lab-sidebar">
            <a href="../labs.html" class="back-btn"><i class="fa-solid fa-arrow-left"></i> Quay lại mục lục</a>
            <h2>{LAB_TITLE}</h2>
            <ul class="lab-list" id="labList">
                {LAB_LINKS}
            </ul>
        </aside>

        <!-- Main Content -->
        <div class="lab-content">
            <div class="lab-title-bar">
                <h3 id="currentFileName">Đang hiển thị: {FIRST_FILE_NAME}</h3>
                <a href="{FIRST_FILE_PATH}" id="openNewTab" target="_blank"><i class="fa-solid fa-external-link-alt"></i> Mở trong Tab mới</a>
            </div>
            <div class="lab-iframe-container">
                <iframe id="labFrame" src="{FIRST_FILE_PATH}"></iframe>
            </div>
        </div>
    </div>

    <script>
        const labLinks = document.querySelectorAll('#labList a');
        const labFrame = document.getElementById('labFrame');
        const currentFileName = document.getElementById('currentFileName');
        const openNewTab = document.getElementById('openNewTab');

        labLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class
                labLinks.forEach(l => l.classList.remove('active'));
                
                // Add active class to clicked link
                this.classList.add('active');
                
                // Get data
                const src = this.getAttribute('data-src');
                const name = this.getAttribute('data-name');
                
                // Update iframe
                labFrame.src = src;
                
                // Update title bar
                currentFileName.textContent = "Đang hiển thị: " + name;
                openNewTab.href = src;
            });
        });
    </script>
</body>
</html>`;

if (!fs.existsSync('labs')) {
    fs.mkdirSync('labs');
}

labsData.forEach(lab => {
    let linksHtml = '';
    lab.items.forEach((item, index) => {
        const isActive = index === 0 ? 'class="active"' : '';
        linksHtml += '<li><a href="#" data-src="' + item.path + '" data-name="' + item.name + '" ' + isActive + '><i class="fa-solid fa-file-code"></i> ' + item.name + '</a></li>\n                ';
    });
    
    let pageHtml = headerHtml
        .replace(/{LAB_TITLE}/g, lab.title)
        .replace(/{LAB_LINKS}/g, linksHtml)
        .replace(/{FIRST_FILE_NAME}/g, lab.items[0].name)
        .replace(/{FIRST_FILE_PATH}/g, lab.items[0].path);
            fs.writeFileSync('labs/lab' + lab.id + '.html', pageHtml, 'utf8');
});

console.log('Generated 8 lab HTML pages successfully!');
