# **Ресурси та API для космічного челенджу**

[https\://gemini.google.com/app/69852c14ddac733d](https://gemini.google.com/app/69852c14ddac733d)

*User prompt: Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars Join the Challenge \- Details \- Resources \- Teams Event 2026 NASA Space Apps Challenge Difficulty Intermediate Beginner/Youth Subjects Astrophysics Planets & Moons Space Exploration Since the 1960s, NASA has left hardware across the solar system–on the Moon, on Mars, and in deep space. From rovers and instruments that completed their science missions to probes still traveling away from Earth this hardware varies widely in both its purpose and current level of functionality. Your challenge is to tell the story of some or all of this equipment that introduces school-age space enthusiasts to the hardware and the science it made possible. Background For over half a century, humanity has sent incredible machines to the Moon, Mars, and other celestial bodies. When their missions end, probes, rovers, landers, descent stages, and scientific instruments are left behind, standing—or flying—silently as monuments to human exploration. While space agencies know the histories of these machines, school-age space enthusiasts often hear only about active, ongoing missions. There is a real opportunity here to inspire the next generation using the rich, untold histories of these off-world artifacts and the groundbreaking science that paved the way for today's achievements and tomorrow’s exploration. To respond to this challenge, participants will want to know what types of equipment currently reside on the Moon, on Mars, and elsewhere—old rovers, descent stages, scientific payloads—and the specific missions they facilitated. The priority is to translate complex historical and scientific data into an engaging narrative. People looking to learn about past space missions often work through dense technical websites or historical textbooks that lack the spark of imagination and storytelling needed to capture a younger or more casual audience's attention. Potential projects could include an interactive map of the Moon with clickable "ghost rovers," a digital graphic novel told from the perspective of a dormant Mars lander, or an audio podcast series chronicling the final days of a deep space instrument. We encourage you to think outside the box and develop your own creative alternatives\! Objectives The goal of this challenge is to create an engaging, story-driven educational tool or narrative that teaches school-age and casual space enthusiasts about the hardware left on the Moon, Mars, and elsewhere. Your project might bring these silent or active artifacts (back) to life, explaining what they are, why they were originally sent into space, and the scientific discoveries they made and continue to make. Your final project can take many forms, and we welcome a variety of formats and technologies. For example, you might develop an interactive web-based experience using HTML, CSS, or JavaScript; prototype an educational video game using a game engine of your choice; write and illustrate a digital children's book; produce a short animated video; design an interactive 3D timeline; or take another approach entirely\! Potential Considerations Regardless of the medium or technology you choose, a strong narrative focus will serve your project well. Consider weaving real historical facts and mission data into your story, and showing your audience how these missions operated rather than listing facts about them. The aim is to draw a clear, exciting connection between the engineering of the hardware and the scientific knowledge humanity gained from it. By the end of your story, your audience might walk away feeling a personal connection to these forgotten robotic explorers and inspired by the science they conducted. Accuracy is important throughout\! You may (but are not required to) consider the following: \- What age group is your story designed for? \- How accessible is the format you chose to use? \- Do you want to focus on specific missions and pieces of equipment, or tell a broader story about NASA’s exploration? \- What perspective(s) do you want to highlight? For data and resources related to this challenge, refer to the Resources tab at the top of the page. More resources may be added before the hackathon begins. ;fdfq yf erh\[ymrbvb slt\[ lkz ljcks;tyyz порадбнименія як є наса ресурси жерала істочнки які потрібно апі дял інтеграціяй*

Response: Для успішної реалізації челенджу **"Abandoned but not Forgotten"** (Покинуті, але не забуті) у рамках NASA Space Apps Challenge вам знадобляться три категорії ресурсів: каталоги локацій і обладнання, 3D-моделі та медіа, а також програмні API для інтерактивної інтеграції в додаток чи вебсайт.

**Офіційні бази даних та каталоги артефактів (Джерела даних)**

> * **NASA Catalogue of Manmade Material on the Moon:** Офіційний документ NASA, який містить вичерпний перелік усього обладнання, залишеного на Місяці (від ступенів ракет Saturn V і спускних модулів Apollo до ретрорефлекторів, сейсмометрів і роверів). У ньому вказані точні координати, маса та статус об'єктів.  
> * **NASA Solar System Treks (Moon Trek & Mars Trek):** Інтерактивні вебпортали (trek.nasa.gov), де вже нанесені місця посадок усіх місій (Apollo, Surveyor, Viking, Pathfinder, Spirit, Opportunity, InSight, Ingenuity). Вони дозволяють витягувати шари карт (GIS data) та точні координати посадкових майданчиків.  
> * **NASA Planetary Data System (PDS):** Головний архів наукових даних планетних місій (pds.nasa.gov). Саме тут зберігаються оригінальні наукові результати, телеметрія та звіти старих апаратів, які допоможуть точно описати, яку саме науку зробив кожен «забутий» прилад.  
> * **NASA Space Science Data Coordinated Archive (NSSDCA):** Каталог усіх космічних запусків та інструментів. Дозволяє за назвою місії знайти опис кожного окремого датчика чи камери на борту старого апарата та їхні відкриття.

**API для технічної інтеграції у ваш проєкт**

> * **NASA Trek WMTS / REST API:** Дозволяє інтегрувати інтерактивні 3D-глобуси або 2D-карти Місяця та Марса безпосередньо у ваш вебзастосунок (через Leaflet, OpenLayers або CesiumJS). Ви можете накладати маркери «привидів-роверів» на реальні супутникові знімки поверхні з високою роздільною здатністю.  
> * **NASA Mars Rover Photos API:** Хоча частина роверів уже неактивна (Spirit, Opportunity), цей API (доступний на api.nasa.gov) дає змогу програмно отримувати архівні фотографії з їхніх камер (FHAZ, RHAZ, NAVCAM, PANCAM) за конкретний марсіанський день (Sol), включно з їхніми останніми знімками перед втратою зв'язку.  
> * **NASA Image and Video Library API:** REST API (images-api.nasa.gov) для автоматичного пошуку та підвантаження історичних фотографій, аудіозаписів та відео підготовки місій, схем апаратів та архівних кадрів.  
> * **SSD/CNEOS Horizons API (JPL):** Якщо ви захочете додати до історії апарати, що досі летять у глибокому космосі або перебувають на геліоцентричних орбітах (наприклад, Pioneer 10/11, Voyager або старі ступені ракет), цей API надасть їхні точні ефемериди (поточні координати в реальному часі).

**3D-моделі та візуальні ресурси (Для ігор, AR/VR та інтерактиву)**

> * **NASA 3D Resources (nasa3d.arc.nasa.gov та репозиторій NASA на GitHub):** Безкоштовна бібліотека готових 3D-моделей (.glb, .obj, .stl) роверів (Sojourner, Opportunity, Curiosity), спускних апаратів (Viking, Apollo Lunar Module, InSight) та супутників. Їх можна одразу імпортувати в Unity, Unreal Engine або Three.js.  
> * **Lunar Reconnaissance Orbiter Camera (LROC) Featured Sites:** Команда апарата LRO регулярно публікує знімки високої роздільної здатності місць посадки місій Apollo, Surveyor та Луноходів, де з орбіти видно залишені модулі та навіть сліди коліс і астронавтів.  
> * **HiRISE (Mars Reconnaissance Orbiter):** Архів знімків Марса з орбіти, де зафіксовані реальні місця «спочинку» роверів Opportunity, Spirit, спускного модуля InSight, гелікоптера Ingenuity зі зламаною лопаттю та скинутих теплових щитів і парашутів.

**Ідеї для дослідження та сторітелінгу (На чому побудувати сюжет)**

> * **«Щоденник останнього Сола» (Вебдосвід зі скролінг-анімацією):** Інтерактивна історія від першої особи (наприклад, ровера Opportunity під час пилової бурі 2018 року або стаціонарного модуля InSight, чиї сонячні панелі поступово засипає пилом). Використайте Mars Rover Photos API, щоб показувати реальні знімки, які стають темнішими з кожним кроком історії, та пояснюйте, які відкриття про воду чи марсотруси вони встигли передати.  
> * **«Космічні археологи» (2D/3D гра або інтерактивна карта на Three.js / Cesium):** Гравець у ролі школяра-дослідника майбутнього (наприклад, 2070 року) літає над картою Місяця чи Марса (через Trek API), сканує поверхню, знаходить старе обладнання (моделі з NASA 3D Resources) і «реконструює» його місію. Наприклад, знаходить лазерний ретрорефлектор Apollo 11 і дізнається, що він працює *досі* без жодного джерела живлення, вимірюючи віддалення Місяця від Землі.  
> * **«Друге життя космічного сміття» (Інтерактивний комікс або візуальна новела):** Історія про те, як навіть відпрацьовані частини приносили користь науці — наприклад, як треті ступені ракет Saturn V (S-IVB) навмисно спрямовували в поверхню Місяця, щоб залишені там сейсмометри попередніх місій зафіксували штучний «місяцетрус» і допомогли вивчити внутрішню будову супутника.

Який формат проєкту (інтерактивний вебсайт, гра на рушії чи мобільний додаток) ви плануєте обрати для своєї команди?

---

*User prompt: Офіційні бази даних та каталоги артефактів (Джерела даних) API для технічної інтеграції у ваш проєкт які паврала як наса доступ отримати апі ключякі дані струткури промтпит сутнсоіт щ полялими аі енд поінти напсиаши пом проамтпт для ресетча можан декліька*

Response: Технічний гайд охоплює роботу з джерелами даних NASA для челенджу **«Abandoned but not Forgotten»**: отримання доступу, правила лімітів, точні URL ендпоінтів, архітектуру сутностей (схеми даних з полями) та готові промпти для глибокого ресерчу і парсингу даних.

**1\. Як отримати API-ключ NASA та правила використання (Rate Limits)**

Більшість відкритих REST API NASA працюють через єдиний шлюз або взагалі не вимагають авторизації (як медіатека чи карти).

> * **Де отримати ключ:** Перейдіть на портал \[https\://api.nasa.gov/\](https\://api.nasa.gov/) у розділ **Generate API Key**. Заповніть форму (First Name, Last Name, Email) — ключ миттєво прийде на пошту і з'явиться на екрані.  
> * **Як передавати ключ:** Додавайте query-параметр ?api\_key=ВАШ\_КЛЮЧ до кожного HTTP GET-запиту.  
> * **Правила та ліміти (Rate Limits):**  
  * DEMO\_KEY (можна писати прямо замість ключа для швидких тестів): **30 запитів на годину** та **50 запитів на добу** з однієї IP-адреси.  
  * Персональний api\_key: **1 000 запитів на годину** сумарно по всіх ендпоінтах api.nasa.gov. При перевищенні ліміту ключ тимчасово блокується рівно на 1 годину.  
  * **Безкоштовні API без ключа:** *NASA Image and Video Library API*, *Solar System Treks WMTS* та *JPL Horizons API* не потребують api\_key взагалі.  
> * **Правила використання для хакатону:** Усі дані NASA знаходяться у суспільному надбанні (Public Domain). Єдина вимога — вказати у футері або в розділі Credits: *"Data and imagery provided by NASA / JPL-Caltech / ASU"*, але без натяку на те, що NASA офіційно спонсорує чи схвалює ваш продукт.

**2\. Ключові API Ендпоінти для проєкту**

**NASA Image and Video Library API (Фото, відео, аудіо та схеми всіх місій)** Не потребує ключа. Ідеально підходить для отримання зображень «покинутих» апаратів (Surveyor, Apollo, Viking, Pathfinder, Spirit, Opportunity, InSight, Ingenuity).

> * **Пошук медіа:** GET \[https\://images-api.nasa.gov/search?q=\](https\://images-api.nasa.gov/search?q=){query}\&media\_type={image\|video\|audio}  
  * *Приклад:* \[https\://images-api.nasa.gov/search?q=Opportunity%20rover%20deck\&media\_type=image\](https\://images-api.nasa.gov/search?q=Opportunity%20rover%20deck\&media\_type=image)  
> * **Отримання списку файлів конкретного асету:** GET \[https\://images-api.nasa.gov/asset/\](https\://images-api.nasa.gov/asset/){nasa\_id}  
> * **Отримання метаданих (EXIF, опис):** GET \[https\://images-api.nasa.gov/metadata/\](https\://images-api.nasa.gov/metadata/){nasa\_id}

**Mars Rover Photos & Manifests API (Історія та останні кадри роверів)** Дозволяє витягти маніфест місії (дату посадки, статус complete для мертвих роверів Spirit/Opportunity, останній Sol) та фото з камер. *(Примітка: якщо основний шлюз api.nasa.gov/mars-photos перевантажений або архівований, використовуйте прямий API-каталог медіатеки або кешовані дампи маніфестів)*.

> * **Маніфест ровера:** GET \[https\://api.nasa.gov/mars-photos/api/v1/manifests/\](https\://api.nasa.gov/mars-photos/api/v1/manifests/){rover\_name}?api\_key=YOUR\_KEY (де rover\_name: spirit, opportunity, curiosity, perseverance).  
> * **Фото за конкретний марсіанський день (Sol):** GET \[https\://api.nasa.gov/mars-photos/api/v1/rovers/\](https\://api.nasa.gov/mars-photos/api/v1/rovers/){rover\_name}/photos?sol={sol\_number}\&camera={camera\_code}\&api\_key=YOUR\_KEY.

**NASA Solar System Treks WMTS (Тайли карт Місяця та Марса для Leaflet / Cesium / Three.js)** Не потребує ключа. Віддає тайли поверхні у стандарті OGC WMTS.

> * **Базовий глобальний шар Місяця (LRO WAC Mosaic):** \[https\://trek.nasa.gov/tiles/Moon/EQ/LRO\_WAC\_Mosaic\_Global\_303ppd\_v02/1.0.0/default/default028mm/\](https\://trek.nasa.gov/tiles/Moon/EQ/LRO\_WAC\_Mosaic\_Global\_303ppd\_v02/1.0.0/default/default028mm/){TileMatrix}/{TileRow}/{TileCol}.jpg  
> * **Базовий глобальний шар Марса (Viking Color Mosaic):** \[https\://trek.nasa.gov/tiles/Mars/EQ/Mars\_Viking\_MDIM21\_ClrMosaic\_global\_232m/1.0.0/default/default028mm/\](https\://trek.nasa.gov/tiles/Mars/EQ/Mars\_Viking\_MDIM21\_ClrMosaic\_global\_232m/1.0.0/default/default028mm/){TileMatrix}/{TileRow}/{TileCol}.jpg

**JPL SSD/CNEOS Horizons API (Координати зондів у глибокому космосі)** Не потребує ключа. Для апаратів Voyager 1/2, Pioneer 10/11, New Horizons.

> * **Ендпоінт:** GET \[https\://ssd.jpl.nasa.gov/api/horizons.api?format=json\&COMMAND=\](https\://ssd.jpl.nasa.gov/api/horizons.api?format=json\&COMMAND=)'{spacecraft\_id}'\&OBJ\_DATA='YES'\&MAKE\_EPHEM='YES'\&EPHEM\_TYPE='VECTORS' (наприклад, \-31 для Voyager 1, \-32 для Voyager 2).

**3\. Архітектура сутностей та структури даних (Data Schemas)**

Для побудови бази даних вашого застосунку (бекенд, JSON-каталог або стейт на фронтенді) використовуйте наступну структуру сутностей, яка об'єднує історичні каталоги NASA з їхніми API:

> * **CelestialBody**  
  * **id**: string (PK, наприклад "moon", "mars", "deep\_space")  
  * **name**: string (Назва небесного тіла)  
  * **wmts\_tile\_url**: string (Шаблон URL для рендерингу карти поверхні з NASA Trek)  
  * **radius\_km**: float (Радіус для 3D-глобуса)  
> * **Mission**  
  * **id**: string (PK, NSSDCA ID, наприклад "1969-059A" для Apollo 11 або "2003-027A" для Opportunity)  
  * **name**: string (Назва місії)  
  * **launch\_date**: date (Дата запуску)  
  * **landing\_date**: date \| null (Дата посадки)  
  * **end\_date**: date \| null (Дата втрати зв'язку або завершення місії)  
  * **summary**: string (Загальна мета місії для школярів)  
> * **AbandonedArtifact** *(Головна сутність вашого сторітелінгу)*  
  * **id**: string (PK, унікальний слаговий ідентифікатор, наприклад "apollo-11-lm-eagle", "opportunity-rover")  
  * **mission\_id**: string (FK \-\> Mission.id)  
  * **celestial\_body\_id**: string (FK \-\> CelestialBody.id)  
  * **name**: string (Назва апарата або деталі, наприклад "Lunar Roving Vehicle 1", "InSight Lander")  
  * **artifact\_type**: enum ("ROVER", "LANDER", "DESCENT\_STAGE", "HEAT\_SHIELD", "INSTRUMENT", "RETRO\_REFLECTOR", "IMPACT\_CRATER", "DEEP\_SPACE\_PROBE")  
  * **operational\_status**: enum ("DORMANT", "DESTROYED\_ON\_IMPACT", "PASSIVE\_ACTIVE", "DRIFTING\_ACTIVE", "DRIFTING\_SILENT") — *важливо, бо ретрорефлектори на Місяці працюють досі пасивно\!*  
  * **latitude**: float \| null (Широта на Місяці чи Марсі, від \-90 до 90\)  
  * **longitude**: float \| null (Довгота, від \-180 до 180\)  
  * **location\_name**: string (Назва місця, наприклад "Mare Tranquillitatis", "Perseverance Valley")  
  * **mass\_kg**: float \| null (Маса об'єкта з каталогу NASA)  
  * **last\_contact\_sol**: int \| null (Останній марсіанський день на зв'язку, якщо це Марс)  
  * **cause\_of\_deactivation**: string (Причина «смерті»: пилова буря, вичерпання батареї РІТЕГ, планове падіння для сейсмічного експерименту)  
  * **model\_3d\_url**: string \| null (Посилання на .glb / .obj модель з репозиторію NASA 3D Resources)  
> * **ScientificDiscovery**  
  * **id**: string (PK)  
  * **artifact\_id**: string (FK \-\> AbandonedArtifact.id)  
  * **instrument\_name**: string (Який саме прилад зробив відкриття, наприклад "PSE \- Passive Seismic Experiment", "Pancam", "SEIS")  
  * **title**: string (Короткий заголовок відкриття)  
  * **kid\_friendly\_story**: string (Художній опис від першої або третьої особи: як саме прилад це зробив і чому це змінило науку)  
  * **scientific\_fact**: string (Точний науковий факт з архіву PDS/NSSDCA)  
> * **ArtifactMedia**  
  * **id**: string (PK)  
  * **artifact\_id**: string (FK \-\> AbandonedArtifact.id)  
  * **nasa\_media\_id**: string (ID з NASA Image API або Mars Rover API)  
  * **media\_type**: enum ("PHOTO\_FROM\_SURFACE", "ORBITAL\_PHOTO\_LROC\_HIRISE", "AUDIO", "SCHEMATIC")  
  * **image\_url**: string (Прямий лінк на зображення)  
  * **caption**: string (Підпис, наприклад: *"Останнє фото Opportunity під час глобальної пилової бурі, Sol 5111"*)

**4\. Промпти для AI-ресерчу та генерації бази даних**

Оскільки офіційний *Catalogue of Manmade Material on the Moon* та звіти *NSSDCA* — це сухі таблиці та PDF-документи, використайте наступні промпти (для LLM з доступом до пошуку або для обробки скопійованих таблиць NASA), щоб швидко зібрати валідний JSON-датасет для вашого проєкту.

**Промпт №1: Генерація каталогу найцікавіших артефактів з координатами (Для карти)**

Act as a NASA Space History Researcher and Data Architect for the 2026 NASA Space Apps Challenge ("Abandoned but not Forgotten").   
I need a structured JSON dataset of 15 iconic pieces of hardware left behind on the Moon and Mars based on official NASA sources (NASA Catalogue of Manmade Material on the Moon, NSSDCA, and JPL Mission Archives).

Include a diverse mix of hardware types:  
1\. Active passive instruments (e.g., Apollo 11 Laser Ranging Retroreflector \- LRRR).  
2\. Intentionally crashed rocket stages used for science (e.g., Apollo 13 or 14 S-IVB third stage used for seismic moonquake experiments).  
3\. Dormant rovers and helicopters (e.g., Lunokhod/Apollo LRV, Sojourner, Spirit, Opportunity, Ingenuity Mars Helicopter).  
4\. Stationary landers and discarded entry hardware (e.g., Surveyor 3 which was visited by Apollo 12, Viking 1, InSight lander, Perseverance's discarded parachute/backshell spotted by Ingenuity).

For each item, return strictly valid JSON matching this schema:  
\- id (slug)  
\- name  
\- mission\_name  
\- nssdca\_id (official NASA catalog ID)  
\- body ("moon" or "mars")  
\- artifact\_type ("ROVER", "LANDER", "INSTRUMENT", "IMPACT\_STAGE", "DEBRIS")  
\- operational\_status ("PASSIVE\_ACTIVE", "DORMANT", "DESTROYED\_FOR\_SCIENCE")  
\- coordinates: { "lat": float, "lon": float, "site\_name": string }  
\- mass\_kg (float)  
\- active\_years (string, e.g., "2004 \- 2018")  
\- end\_of\_mission\_reason (exact engineering reason it stopped working)  
\- key\_instruments (array of 2-3 specific scientific instruments onboard)  
\- major\_scientific\_discovery (exact scientific breakthrough this specific hardware enabled)  
\- orbital\_spotted\_by (e.g., "Photographed from orbit by LROC in 2009" or "Spotted by MRO HiRISE")

Ensure 100% factual and coordinate accuracy according to NASA planetary cartography.

**Промпт №2: Перетворення сухих даних місії на сторітелінг для школярів (Генератор контенту карток)**

You are a Science Communicator and Narrative Designer writing for school-age space enthusiasts (ages 10-15) for the NASA "Abandoned but not Forgotten" project.  
Take the following technical data about a piece of abandoned NASA hardware: \[ВСТАВИТИ НАЗВУ АПАРАТА АБО JSON-ОБ'ЄКТ З ПЕРШОГО ПРОМПТУ\].

Write an engaging, accurate profile divided into 4 compact fields (in Ukrainian):  
1\. "first\_person\_monologue": A short, atmospheric 3-4 sentence monologue from the perspective of the machine itself, describing where it is resting right now (the dust, the silence, the view of the crater/plain) and its proudest memory. No clichés—use real physical details of its environment and hardware (e.g., thermal blankets, dusty solar arrays, broken rotor blade, retroreflector mirrors).  
2\. "how\_it\_worked": A simple, vivid analogy explaining how its main scientific instrument worked (connecting the engineering of the tool to how it gathered data).  
3\. "science\_legacy": What humanity learned thanks to this machine before it went silent (or how it still helps scientists today), and how it paved the way for future Artemis or Mars Sample Return missions.  
4\. "nasa\_image\_search\_queries": Provide 3 exact English search queries I can send to \`https\://images-api.nasa.gov/search?q=\` to fetch: (a) the hardware on the surface, (b) an orbital photo from LROC/HiRISE showing it on the ground, and (c) the science/landscape it photographed.

**Промпт №3: Пошук 3D-моделей та орбітальних знімків LROC / HiRISE (Для візуалізації)**

Act as a Technical Researcher for NASA Open Data. For the following list of lunar and Martian artifacts:  
\[Вказати список: наприклад, Apollo Lunar Module, Lunar Roving Vehicle, Viking Lander, Opportunity Rover, InSight, Ingenuity\]

Find and list:  
1\. Whether an official 3D model (.glb / .obj / .stl) exists in the NASA 3D Resources repository (https\://github.com/nasa/NASA-3D-Resources) and the exact folder/file name to look for.  
2\. The exact PIA (Planetary Image Atlas) ID or NASA Image Library \`nasa\_id\` showing:  
   \- The artifact photographed from orbit by LROC (for Moon) or HiRISE (for Mars).  
   \- The final photograph ever transmitted by the artifact (if it had a camera).

**Sources**

> 1. [NASA Open APIs](https://api.nasa.gov/)  
> 2. [NASA API Guide \- SciSpace](https://scispace.com/ai-agent-seo/page-files/nasa-api-guide-6dlgszo8.pdf)  
> 3. [Exploring NASA API: Creating Data-Rich Applications](https://dev.to/zuplo/exploring-nasa-api-creating-data-rich-applications-5ffk)

---

*User prompt: чи можна маршрут отрмиати олвнар а його проект може 3 да моедль щл є ам може якст ьтпу може ще яксь цікаві дані*

Response: Так, отримати **реальні покрокові маршрути (traverse paths)** роверів, гелікоптера Ingenuity та місячних експедицій Apollo не просто можна — у NASA є відкриті GeoJSON та Shapefile-шари, які ідеально лягають на інтерактивну карту або 3D-сцену. Крім того, є готові 3D-моделі самих апаратів, рельєфу кратерів та унікальна телеметрія (звуки, температура, нахил корпусу).

Актуальні прямі джерела, формати та небанальні типи даних можна одразу інтегрувати у ваш проєкт:

### **1\. Де взяти точні маршрути (Traverse Paths & Waypoints) у GeoJSON / JSON**

Для марсіанських місій JPL використовує внутрішню відкриту систему **MMGIS (Multi-Mission Geographic Information System)**. Її файли лежать у відкритому доступі без жодних API-ключів — це чисті GeoJSON-лінії (LineString) та точки зупинок (Point) із прив'язкою до кожного марсіанського дня (Sol), одометрії (пройдених метрів) та висоти:

> * **Прямі ендпоінти NASA MMGIS (Perseverance, Ingenuity, Curiosity):**  
  * Маршрут ровера Perseverance (лінія): \[https\://mars.nasa.gov/mmgis-maps/M20/Layers/json/M20\_traverse.json\](https\://mars.nasa.gov/mmgis-maps/M20/Layers/json/M20\_traverse.json)  
  * Точки зупинок за кожен Sol (Waypoints): \[https\://mars.nasa.gov/mmgis-maps/M20/Layers/json/M20\_waypoints.json\](https\://mars.nasa.gov/mmgis-maps/M20/Layers/json/M20\_waypoints.json)  
  * Маршрут та точки польотів дрона **Ingenuity** (який вже назавжди залишився у «Долині Валінор» зі зламаною лопаттю після 72-го польоту) також публікуються у шарах M20.  
  * Маршрут Curiosity (MSL): аналогічні файли MSL\_waypoints.json та MSL\_traverse.json у гілці /mmgis-maps/MSL/Layers/json/.  
> * **Маршрути «мертвих» роверів (Spirit, Opportunity, Sojourner):**  
  * **PDS Geosciences Node (Analyst's Notebook — an.rsl.wustl.edu):** Офіційний архів Вашингтонського університету та NASA, де у розділі *Maps \-\> Traverse map \-\> Resources* лежать повні таблиці координат і векторні лінії для **Spirit** (7.73 км до застрягання в піщаній пастці *Troy*) та **Opportunity** (45.16 км до пилової бурі в *Perseverance Valley*).  
  * **Агреговані GeoJSON-дампи (azmth.space/mars/data):** Спільнота розробників космічних карт уже склеїла офіційні архіви PDS та MMGIS в єдині чисті JSON-файли з координатами та Sol для кожної точки маршруту: opportunity.json (19 721 точка від Sol 1 до 5111), spirit.json (7 871 точка), ingenuity.json (7 647 точок усіх 72 польотів), sojourner.json (78 солів навколо станції Pathfinder).  
> * **Маршрути на Місяці (Apollo LRV — «Місячні багі» та астронавти):**  
  * **LROC PDS Archive (lroc.sese.asu.edu / astrogeology.usgs.gov):** Команда орбітального зонда LRO по пікселях відмалювала реальні сліди коліс роверів Apollo 15, 16, 17 та піші маршрути Apollo 11, 12, 14\. Вони доступні як векторні **Shapefiles** (\_PATHS — маршрути, \_STATIONS — зупинки, \_EQUIPMENT — залишені прилади, \_SAMPLES — місця взяття каміння), які за 5 секунд конвертуються у GeoJSON.

### **2\. Готові 3D-моделі: Ровери, Уламки та Рельєф місцевості**

Вам не потрібно моделювати апарати з нуля — NASA викладає інженерні та адаптовані для вебу моделі у відкритий доступ:

> * **3D-моделі самих апаратів (\[github.com/nasa/NASA-3D-Resources\](https\://github.com/nasa/NASA-3D-Resources) та science.nasa.gov/3d-resources/):**  
  * У форматах **.glb / .gltf** (ідеально для Three.js, React Three Fiber, Babylon.js) та **.obj / .fbx** є:  
    * Ровери: *Opportunity / Spirit (MER)*, *Sojourner*, *Curiosity*, *Perseverance*, місячний ровер *Apollo Lunar Roving Vehicle (LRV)*.  
    * Гелікоптер *Ingenuity*.  
    * Посадкові платформи та зонди: *Apollo Lunar Module (Eagle)*, *Viking Lander*, *InSight Lander* (разом із роботизованою рукою та куполом сейсмометра SEIS), *Surveyor*, а також глибококосмічні *Voyager*, *Pioneer*, *Cassini*.  
    * Навіть окремі знакові деталі: наприклад, 3D-модель **парашута та захисного кожуха (backshell)** або **титанових пробірок зі зразками ґрунту** (*Three Forks Sample Depot*), які Perseverance скинув просто на пісок Марса чекати майбутньої експедиції.  
> * **3D-моделі реальних кратерів та місць стоянки (3D Terrain Meshes):**  
  * **HiRISE DTM (Digital Terrain Models) та LROC NAC DTM:** Це реальні карти висот місць посадки з точністю до 25–50 см на піксель. Ви можете завантажити готовий 3D-меш кратера *Victoria* чи *Endurance* (які досліджував Opportunity) або пагорбів *Columbia Hills* (де назавжди зупинився Spirit) і поставити 3D-модель ровера в його реальну фінальну точку\!

### **3\. Які ще «незвичайні» та круті дані можна витягнути для Вау-ефекту?**

Щоб проєкт на хакатоні виділявся серед звичайних вікі-довідників, додайте до маршруту та 3D-моделі **живу телеметрію останніх днів апарата**:

> 1. **Енергетичне «згасання» (Dust Factor & Solar Array Energy):**  
   * У відкритих архівах PDS для *Opportunity*, *Spirit* та *InSight* є показник прозорості атмосфери (**Tau / Optical Depth**) та виробітку енергії сонячними панелями у Ват-годинах (Wh).  
   * *Ідея для фічі:* Зробіть повзунок часу (Timeline). Коли користувач тягне його до останнього дня Opportunity (Sol 5111, червень 2018), на екрані росте рівень пилу (Tau піднімається до рекордних \>10.8), освітлення у вашій 3D-сцені темніє до повної темряви, а заряд батареї падає з 700 Wh до критичних 22 Wh.  
> 2. **Кути нахилу корпусу (Rover Tilt / Pitch & Roll) та «Передсмертна орієнтація»:**  
   * Коли **Spirit** у 2009 році провалився крізь сульфатну кірку в пісок у точці *Troy*, його так і не змогли вирівняти. Перед настанням марсіанської зими його сонячні панелі залишилися нахиленими у невигідний бік від Сонця — і він замерз. Маючи ці кути нахилу з телеметрії, ви можете у 3D-в'ювері нахилити модель Spirit під тим самим реальним кутом, під яким він стоїть там просто зараз.  
> 3. **Кладбище пробірок (Three Forks Sample Depot) та скинутий щит:**  
   * Залишене обладнання — це не лише мертві ровери\! У січні 2023 року Perseverance виклав на поверхню Марса **10 титанових пробірок** із кернами породи зигзагом (на випадок, якщо сам ровер вийде з ладу до прильоту місії повернення). Координати кожної пробірки є в M20\_waypoints.json.  
   * Також дрон Ingenuity під час 26-го польоту підлетів і сфотографував зблизька розбитий **задній щит (backshell) і гігантський парашут**, які лежать у піску, наче уламки літаючої тарілки. Це неймовірні візуальні точки на маршруті\!  
> 4. **Реальні аудіозаписи та сейсмограми («Голоси привидів»):**  
   * Зонд **InSight** (який «помер» у грудні 2022 через пил на панелях) залишив по собі записи марсіанського вітру та понад 1300 марсотрусів, переведених у звуковий діапазон (доступні через *NASA Image and Video Library API* за запитом InSight audio або marsquake audio).  
   * Для місій **Apollo** у відкритому доступі є оригінальні аудіопереговори астронавтів у момент, коли вони паркували ровер востаннє і встановлювали наукові прилади ALSEP.  
> 5. **Останні панорами та «Автопортрети пилу»:**  
   * Перед тим як InSight вимкнувся назавжди, він зробив останнє селфі своєї вкритої товстим шаром червоного пилу палуби. А Opportunity передав свій знаменитий останній кадр — зашумлений чорний квадрат із ледь помітною плямою Сонця крізь бурю.

### **4\. Як розширити вашу схему даних під маршрути та 3D**

Додайте до попередньої архітектури сутність **TraverseStep (Точка маршруту)**:

> * **TraverseWaypoint**  
  * **id**: string (PK)  
  * **artifact\_id**: string (FK \-\> AbandonedArtifact.id)  
  * **sol\_or\_eva**: int (Номер марсіанського дня або виходу на поверхню Місяця)  
  * **latitude**: float  
  * **longitude**: float  
  * **elevation\_m**: float (Висота над рівнем референсного еліпсоїда/ареоїда для побудови профілю висот)  
  * **odometry\_total\_m**: float (Скільки метрів апарат проїхав від місця посадки до цієї точки)  
  * **event\_type**: enum ("LANDING", "DRILL\_SITE", "SAMPLE\_DROP", "STUCK\_IN\_SAND", "BROKEN\_BLADE", "FINAL\_SIGNAL")  
  * **telemetry\_snapshot**: json ({ "power\_wh": 22, "dust\_tau": 10.8, "temp\_c": \-65, "pitch\_deg": \-11.5 })  
  * **story\_snippet**: string (Коротка подія на цій зупинці: наприклад, *"Sol 400: Тут Opportunity знайшов залізо-нікелевий метеорит Heat Shield Rock просто поруч зі своїм власним скинутим тепловим щитом\!"*)

Бажаєте отримати готовий скрипт (наприклад, на Python або JS/TypeScript) для автоматичного стягування і парсингу цих GeoJSON-маршрутів та фотографій з NASA MMGIS?

**Sources**

> 1. [Solar System Registry — Library](https://www.solarsystemregistry.org/library.html)  
> 2. [NASA AMMOS Multi-Mission Geographic Information System](https://www.hou.usra.edu/meetings/planetdata2021/presentations/AV_Tools_planetdata2021.pdf)  
> 3. [A step-by-step guide to obtaining drive distance etc from the mission](https://www.reddit.com/r/PerseveranceRover/comments/m0b7kh/a_stepbystep_guide_to_obtaining_drive_distance/)  
> 4. [Mars Rovers — Live Position Map, Photos & Data \- Orbital Radar](https://orbitalradar.com/mars-rovers)  
> 5. [Mars data, free to reuse \- azmth](https://azmth.space/mars/data)  
> 6. [Traverse map](https://an.rsl.wustl.edu/help/Content/Using%20the%20Notebook/Main%20sections/Maps/Traverse%20map.htm)  
> 7. [Curiosity & Perseverance Routes \- About \| ATS Mars Atlas \- ATS Labs](https://labs.allthingsspatial.io/about/mars-atlas/)  
> 8. [perseverance/data/percy\_pipeline/ingestion/nasa.py at main \- GitHub](https://github.com/javiladino/perseverance/blob/main/data/percy_pipeline/ingestion/nasa.py)  
> 9. [Traverse Map for Mars Rover Curiosity as of Jan. 26, 2014](https://science.nasa.gov/resource/traverse-map-for-mars-rover-curiosity-as-of-jan-26-2014/)  
> 10. [Файл:Путь пройденный Кьюриосити на 29 сол (04.09.2012).jpg](https://ru.wikipedia.org/wiki/%D0%A4%D0%B0%D0%B9%D0%BB:%D0%9F%D1%83%D1%82%D1%8C_%D0%BF%D1%80%D0%BE%D0%B9%D0%B4%D0%B5%D0%BD%D0%BD%D1%8B%D0%B9_%D0%9A%D1%8C%D1%8E%D1%80%D0%B8%D0%BE%D1%81%D0%B8%D1%82%D0%B8_%D0%BD%D0%B0_29_%D1%81%D0%BE%D0%BB_\(04.09.2012\).jpg)

---

*User prompt: можеш кожно типсу сустонсотей дані які моєна отрмиати*

Response: Повна специфікація даних для кожного типу сутностей показує, які саме поля, метрики та медіафайли можна реально витягнути з відкритих джерел NASA (API, GeoJSON-шарів MMGIS, каталогів PDS та NSSDCA) для вашої бази даних.

### **1\. Сутність CelestialBody (Небесне тіло / Сцена)**

Використовується для ініціалізації 2D-карти (Leaflet / OpenLayers) або 3D-глобуса (CesiumJS / Three.js).

> * **Джерело:** NASA Solar System Treks (trek.nasa.gov), JPL Planetary Fact Sheet.  
> * **Які дані можна отримати:**  
  * id (string): "moon", "mars", "deep\_space".  
  * name (string): Назва тіла ("Місяць", "Марс").  
  * radius\_km (float): Екваторіальний радіус (1737.4 для Місяця, 3396.2 для Марса) — потрібен для правильного розрахунку координатної сітки та масштабу 3D-сфери.  
  * gravity\_ms2 (float): Гравітація (1.62 м/с² або 3.72 м/с²) — цікава деталь для фізики або карток порівняння.  
  * wmts\_base\_layer\_url (string): Прямий лінк на тайли глобальної карти (наприклад, *LRO WAC Mosaic* для Місяця або *Viking/MRO Global Mosaic* для Марса).  
  * dem\_elevation\_layer\_url (string): Шар карти висот (Digital Elevation Model — *LOLA* для Місяця, *MOLA* для Марса), щоб рельєф кратерів у 3D був об'ємним.

### **2\. Сутність Mission (Космічна місія)**

Групує кілька артефактів, які прилетіли разом (наприклад, місія *Apollo 15* залишила посадковий ступінь, місячний ровер LRV-1, сейсмометр, ретрорефлектор та упавший ступінь ракети S-IVB).

> * **Джерело:** NSSDCA (NASA Space Science Data Coordinated Archive) та Mars Rover Manifest API.  
> * **Які дані можна отримати:**  
  * nssdca\_id (string): Міжнародний ідентифікатор запуску (наприклад, "1971-063A" або "2003-027A").  
  * name (string): Назва місії ("Apollo 15", "Mars Exploration Rover \- Opportunity", "Mars 2020").  
  * agency (string): "NASA", "NASA / JPL".  
  * launch\_date (datetime): Точна дата і час старту з Землі.  
  * landing\_date (datetime): Дата і час посадки на поверхню.  
  * end\_date (datetime \| null): Дата офіційного завершення місії або останнього сеансу зв'язку.  
  * planned\_duration\_days (int): Планова тривалість місії (наприклад, 90 солів для Opportunity) — круто контрастує з реальною тривалістю (5352 соли) для сторітелінгу.  
  * actual\_duration\_days (int): Скільки реально пропрацювала.  
  * landing\_site\_name (string): Офіційна назва району посадки ("Hadley Rille", "Meridiani Planum", "Jezero Crater").

### **3\. Сутність AbandonedArtifact (Покинутий об'єкт / Обладнання)**

Центральна сутність проєкту. Оскільки на Місяці та Марсі лежать дуже різні речі, окрім базових полів, кожен підтип (artifact\_type) має свої унікальні дані, які можна спарсити.

> * **Джерело:** *NASA Catalogue of Manmade Material on the Moon*, *MMGIS Layers*, *JPL Fact Sheets*.

**Базові поля (спільні для всього обладнання):**

> * id (string), mission\_id (FK), celestial\_body\_id (FK).  
> * name (string): Назва об'єкта ("Opportunity Rover", "Apollo 11 Lunar Module Descent Stage 'Eagle'", "Ingenuity Mars Helicopter").  
> * artifact\_type (enum): "ROVER", "HELICOPTER", "LANDER", "DESCENT\_STAGE", "IMPACT\_STAGE", "INSTRUMENT", "RETRO\_REFLECTOR", "ENTRY\_DEBRIS", "SAMPLE\_TUBE", "DEEP\_SPACE\_PROBE".  
> * operational\_status (enum): "DORMANT" (мовчить), "DESTROYED\_ON\_IMPACT" (розбитий об поверхню), "PASSIVE\_ACTIVE" (працює без живлення, як дзеркала), "ACTIVE\_TRANSMITTING" (Voyager 1/2).  
> * latitude (float), longitude (float), elevation\_m (float): Фінальні координати, де об'єкт лежить просто зараз.  
> * mass\_kg (float): Суха маса об'єкта на поверхні (є у таблицях NASA для кожного уламка до грама).  
> * power\_source (enum): "SOLAR" (сонячні панелі), "RTG" (радіоізотопний генератор на плутонії-238), "BATTERY" (хімічні батареї), "PASSIVE" (не потребує живлення).  
> * cause\_of\_deactivation (string): Технічна причина виходу з ладу (пилова буря, замерзання електроніки, злам лопаті ротора, плановий удар об ґрунт).

**Специфічні дані за підтипами artifact\_type (JSONB поле specific\_metadata):**

> * **Для Роверів (ROVER — Spirit, Opportunity, Sojourner, Apollo LRV 1/2/3):**  
  * total\_odometry\_km (float): Загальна пройдена дистанція (45.16 км для Opportunity, 35.74 км для Apollo 17 LRV).  
  * max\_speed\_kmh (float): Максимальна швидкість.  
  * final\_sol\_or\_eva (int): Номер останнього марсіанського дня або виходу астронавтів.  
  * final\_tilt\_pitch\_deg / final\_tilt\_roll\_deg (float): Фінальний нахил кузова (критично для Spirit, який застряг у піску під кутом, не зміг розвернути панелі до зимового Сонця і замерз).  
> * **Для Гелікоптера (HELICOPTER — Ingenuity):**  
  * total\_flights (int): 72 польоти.  
  * total\_flight\_time\_min (float): 128.8 хвилин у небі Марса.  
  * max\_altitude\_m (float): 24.0 метри.  
  * damage\_description (string): Пошкодження кінчиків карбонових лопатей під час жорсткої посадки в піщаних дюнах на Sol 1035\.  
> * **Для Відпрацьованих ступенів ракет та Орбітальних зондів (IMPACT\_STAGE — Saturn V S-IVB, злітні ступені LM, GRAIL Ebb & Flow, Lunar Prospector):**  
  * impact\_velocity\_kms (float): Швидкість зіткнення з поверхнею (наприклад, 2.58 км/с).  
  * kinetic\_energy\_joules / tnt\_equivalent\_kg (float): Енергія удару в тротиловому еквіваленті (є в звітах Apollo Seismic Experiments — удар S-IVB дорівнював \~11 тоннам тротилу).  
  * crater\_diameter\_m (float): Діаметр штучного кратера, який сфотографував LROC з орбіти (близько 30–40 метрів).  
> * **Для Пасивних приладів та Дзеркал (RETRO\_REFLECTOR / INSTRUMENT — LRRR Apollo 11, 14, 15; SEIS; ALSEP):**  
  * still\_used\_by\_earth (boolean): true для лазерних ретрорефлекторів — по них обсерваторії Землі стріляють лазером і сьогодні.  
  * corner\_cubes\_count (int): Кількість кварцових призм у панелі (100 в Apollo 11/14, 300 в Apollo 15).  
> * **Для Скинутих деталей посадки та Пробірок (ENTRY\_DEBRIS / SAMPLE\_TUBE — парашути, теплові щити, Sky Crane, 10 пробірок Perseverance):**  
  * sample\_number / rock\_type (string): Для пробірок у депо *Three Forks* — назва породи або атмосфери всередині та Sol, коли її поклали на ґрунт.  
  * distance\_from\_lander\_m (float): На якій відстані від основного апарата впав тепловий щит чи розбився Sky Crane.  
> * **Для Зондів глибокого космосу (DEEP\_SPACE\_PROBE — Pioneer 10/11, Voyager 1/2, New Horizons):**  
  * distance\_from\_earth\_au / distance\_km (float): Поточна відстань в астрономічних одиницях (оновлюється в реальному часі через *JPL Horizons API*).  
  * heliocentric\_velocity\_kms (float): Поточна швидкість відносно Сонця (наприклад, 17.0 км/с).  
  * signal\_roundtrip\_hours (float): Скільки годин іде радіосигнал туди й назад (понад 45 годин для Voyager 1).

### **4\. Сутність TraverseWaypoint (Точка маршруту та Телеметрія)**

Дозволяє відмалювати на карті реальний шлях ровера чи дрона і клікати на кожну зупинку.

> * **Джерело:** NASA MMGIS (M20\_waypoints.json, M20\_traverse.json, MSL\_waypoints.json), PDS Analyst's Notebook (an.rsl.wustl.edu для Spirit/Opportunity), LROC Shapefiles (для Apollo).  
> * **Які дані можна отримати з JSON-файлів:**  
  * artifact\_id (FK).  
  * sol\_or\_step (int): Марсіанський день (Sol) або номер зупинки (Station 1..10 на Місяці, або Flight 1..72 для Ingenuity).  
  * latitude (float), longitude (float), elevation\_m (float): Точні 3D-координати точки.  
  * odometry\_m (float): Накопичений пробіг у метрах на цей день.  
  * drive\_distance\_m (float): Скільки метрів проїхав конкретно за цей переїзд.  
  * yaw\_deg, pitch\_deg, roll\_deg (float): Орієнтація ровера в просторі у цій точці (є у файлах waypoints.json у полях yaw, pitch, roll, tilt).  
  * solar\_energy\_wh (float \| null): Виробіток енергії сонячними панелями за цей Sol (з PDS Engineering data — наприклад, падіння з 900 Wh до 22 Wh під час бурі).  
  * atmospheric\_opacity\_tau (float \| null): Коефіцієнт запиленості неба (Tau) — від 0.5 у ясний день до 10.8 під час смертельної бурі Opportunity.

### **5\. Сутність ScientificInstrument & Discovery (Прилад та Наукове відкриття)**

Пояснює головну вимогу челенджу: *яку саме науку зробило це залізо перед тим, як замовкнути*.

> * **Джерело:** NSSDCA Experiment Catalog (nssdc.gsfc.nasa.gov/nmc/ExperimentSearch.do), NASA Science Mission Pages.  
> * **Які дані можна отримати:**  
  * artifact\_id (FK).  
  * instrument\_acronym (string): Кодова назва приладу ("Pancam", "APXS", "Mössbauer Spectrometer", "RAT", "SEIS", "HP3").  
  * instrument\_full\_name (string): Повна назва (наприклад, "Rock Abrasion Tool" — алмазна фреза на руці Spirit/Opportunity).  
  * instrument\_purpose (string): Що саме він вимірював (хімічний склад, сейсмічні хвилі, магнітне поле, швидкість вітру).  
  * discovery\_title (string): Головне відкриття (наприклад, *"Гематитові кульки 'Blueberries' — доказ рідкої води на Марсі"* або *"Виявлення рідкого ядра Марса через сейсмічні хвилі"*).  
  * historical\_evidence\_data (string): Конкретний показник, який переконав вчених (наприклад, знахідка мінералу ярозиту або понад 1300 зафіксованих марсотрусів).

### **6\. Сутність ArtifactMedia & 3DAsset (Медіафайли, Звуки та 3D-моделі)**

Візуальне та аудіонаповнення для кожної точки на карті.

> * **Джерело:** NASA Image and Video Library API, Mars Rover Photos API, GitHub nasa/NASA-3D-Resources, LROC Featured Sites, HiRISE Catalog.  
> * **Які дані можна отримати:**  
  * artifact\_id (FK), waypoint\_id (FK \| null).  
  * media\_category (enum):  
    * "SURFACE\_FIRST\_PERSON" — фото з камер самого ровера/лендера (NAVCAM, PANCAM, HAZCAM, IDC).  
    * "LAST\_KNOWN\_PHOTO" — останній переданий кадр в історії апарата (наприклад, фінальне селфі InSight у пилу або чорне небо Opportunity).  
    * "ORBITAL\_PROOF" — фото цього покинутого апарата з космосу (знімки камер **LROC NAC** для Місяця або **MRO HiRISE** для Марса, де видно сам ровер, його сліди та тінь).  
    * "MODEL\_3D" — файл .glb / .gltf або .obj для 3D-огляду апарата в браузері.  
    * "TERRAIN\_MESH\_3D" — 3D-модель ділянки поверхні (DTM кратера чи пагорба).  
    * "AUDIO\_RECORDING" — аудіофайл .mp3/.wav (звук вітру та марсотрусів з InSight, звук польоту Ingenuity, записаний мікрофоном Perseverance, або радіопереговори Apollo).  
  * source\_url (string): Прямий лінк на файл у CDN NASA.  
  * nasa\_id\_or\_pia (string): Офіційний код знімка (наприклад, "PIA22521" або "PIA25626").  
  * captured\_at\_sol\_or\_date (string): Коли зроблено знімок.  
  * camera\_name (string): Назва камери, яка зробила кадр.  
  * credit (string): Обов'язковий копірайт ("NASA/JPL-Caltech/University of Arizona").

---

