<?php session_start(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://kit.fontawesome.com/8e3a2f28fd.js" crossorigin="anonymous"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/navigation.css">
    <title>Campus Navigation — ACLC Fatima</title>
</head>
<body>

    <!-- Background -->
    <div class="nav-background">
        <div class="nav-grid" aria-hidden="true"></div>
        <div class="nav-orbit nav-orbit-one" aria-hidden="true"></div>
        <div class="nav-orbit nav-orbit-two" aria-hidden="true"></div>
        <div class="nav-bg-overlay"></div>
        <div class="nav-bg-content">
            <div class="coming-soon-badge">
                <i class="fa-solid fa-location-crosshairs"></i>
                Campus wayfinding
            </div>
            <h1 class="coming-soon-title">Campus Navigation</h1>
            <p class="coming-soon-subtitle">ACLC College Tacloban - Fatima Campus</p>
            <div class="coming-soon-divider"></div>
            <p class="coming-soon-desc">
                Find your way around ACLC Fatima Campus with guided routes,<br>
                landmark previews, and assistance from the Campus Assistant.
            </p>

            <section class="sample-map" aria-labelledby="sampleMapTitle">
                <div class="sample-map-heading">
                    <div>
                        <p class="section-kicker">Live wayfinding</p>
                        <h2 id="sampleMapTitle">Campus map</h2>
                    </div>
                    <span class="map-status" id="mapStatus"><i class="fa-solid fa-circle"></i> Ready to explore</span>
                </div>
                <div class="route-brief" id="routeBrief" hidden aria-live="polite">
                    <div class="route-brief-icon"><i class="fa-solid fa-route"></i></div>
                    <div class="route-brief-content">
                        <span class="route-brief-label">Suggested route</span>
                        <strong id="routeBriefTitle">Choose a destination</strong>
                        <p id="routeBriefText">The Campus Assistant will show your route here.</p>
                    </div>
                    <span class="route-brief-badge" id="routeBriefBadge">READY</span>
                </div>
                <div class="map-workspace">
                    <div class="map-viewport" id="mapViewport">
                        <div class="map-canvas" id="mapCanvas">
                            <img src="img/3d pic.png" alt="Isometric sample view of the ACLC Fatima Campus" class="campus-map-image" onerror="this.hidden=true; this.nextElementSibling.hidden=false;">
                            <p class="map-image-fallback" hidden>Campus preview image is unavailable.</p>
                            <div class="facility-preview" id="facilityPreview" hidden aria-label="Sample interior view">
                                <div class="facility-ceiling"></div>
                                <div class="facility-wall facility-wall-back">
                                    <div class="facility-window"><span></span><span></span><span></span></div>
                                    <div class="facility-sign" id="facilitySign">ROOM / FACILITY</div>
                                    <div class="facility-door"><span></span></div>
                                </div>
                                <div class="facility-wall facility-wall-side"></div>
                                <div class="facility-floor">
                                    <div class="facility-desk desk-one"><span></span></div>
                                    <div class="facility-desk desk-two"><span></span></div>
                                    <div class="facility-chair chair-one"></div>
                                    <div class="facility-chair chair-two"></div>
                                </div>
                                <div class="facility-caption"><i class="fa-solid fa-location-dot"></i><span id="facilityCaption">Destination preview</span></div>
                            </div>
                            <svg class="map-route" id="mapRoute" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                                <polyline id="mapRouteLine" points=""></polyline>
                            </svg>
                            <div class="map-route-marker map-route-start" id="mapRouteStart" hidden><i class="fa-solid fa-location-arrow"></i><span>Start</span></div>
                            <div class="map-route-marker map-route-destination" id="mapRouteDestination" hidden><i class="fa-solid fa-flag-checkered"></i><span>Destination</span></div>
                            <a href="#mapLocationInfo" class="map-hotspot hotspot-main" data-location="Main Building" data-description="The main building contains classrooms, faculty offices, and student services." aria-label="View Main Building">
                                <i class="fa-solid fa-building"></i><span>Main Building</span>
                            </a>
                            <a href="#mapLocationInfo" class="map-hotspot hotspot-court" data-location="Activity Court" data-description="The open court is the central outdoor landmark near the campus entrance." aria-label="View Activity Court">
                                <i class="fa-solid fa-basketball"></i><span>Activity Court</span>
                            </a>
                            <a href="#mapLocationInfo" class="map-hotspot hotspot-gate" data-location="Main Gate" data-description="The main gate is the easiest starting point for visitors and students arriving on campus." aria-label="View Main Gate">
                                <i class="fa-solid fa-door-open"></i><span>Main Gate</span>
                            </a>
                            <a href="#mapLocationInfo" class="map-hotspot hotspot-garden" data-location="Garden Area" data-description="A green open area beside the building for a short break between classes." aria-label="View Garden Area">
                                <i class="fa-solid fa-tree"></i><span>Garden Area</span>
                            </a>
                        </div>
                    </div>
                    <div class="map-tools" aria-label="Map tools">
                        <button type="button" class="map-tool-btn" id="mapZoomIn" aria-label="Zoom in" title="Zoom in"><i class="fa-solid fa-plus"></i></button>
                        <button type="button" class="map-tool-btn" id="mapZoomOut" aria-label="Zoom out" title="Zoom out"><i class="fa-solid fa-minus"></i></button>
                        <button type="button" class="map-tool-btn" id="mapReset" aria-label="Reset map" title="Reset map"><i class="fa-solid fa-crosshairs"></i></button>
                        <button type="button" class="map-tool-btn map-help-btn" id="mapHelpToggle" aria-label="Show map instructions" aria-expanded="false" title="Map instructions"><i class="fa-solid fa-question"></i></button>
                    </div>
                    <aside class="map-help" id="mapHelp" hidden aria-labelledby="mapHelpTitle">
                        <div class="map-help-heading">
                            <strong id="mapHelpTitle">Using the campus map</strong>
                            <button type="button" id="mapHelpClose" aria-label="Close map instructions"><i class="fa-solid fa-xmark"></i></button>
                        </div>
                        <p><i class="fa-solid fa-hand-pointer"></i> Drag the map to explore another area.</p>
                        <p><i class="fa-solid fa-magnifying-glass-plus"></i> Use plus and minus to change the map size.</p>
                        <p><i class="fa-solid fa-location-dot"></i> Select a map label or ask the Campus Assistant for a route.</p>
                    </aside>
                    <div class="map-legend" aria-label="Map legend">
                        <span><i class="legend-dot legend-start"></i> Starting point</span>
                        <span><i class="legend-dot legend-destination"></i> Destination</span>
                        <span class="map-gesture"><i class="fa-solid fa-hand-pointer"></i> Drag to explore</span>
                    </div>
                </div>
                <div class="map-location-info" id="mapLocationInfo" aria-live="polite">
                    <i class="fa-solid fa-location-dot"></i>
                    <div>
                        <strong id="mapLocationName">Campus overview</strong>
                        <p id="mapLocationDescription">Select a highlighted area to inspect this sample view.</p>
                    </div>
                </div>
            </section>

            <section class="campus-guide" aria-labelledby="campusGuideTitle">
                <div class="campus-guide-heading">
                    <div>
                        <p class="section-kicker">Campus guide</p>
                        <h2 id="campusGuideTitle">Start with a familiar landmark</h2>
                    </div>
                    <i class="fa-solid fa-compass" aria-hidden="true"></i>
                </div>
                <div class="campus-guide-grid">
                    <article class="campus-location" tabindex="0" data-location="Main Building" data-description="The main building contains classrooms, faculty offices, and student services.">
                        <i class="fa-solid fa-building" aria-hidden="true"></i>
                        <div>
                            <h3>Main Building</h3>
                            <p>Classrooms, faculty offices, and student services.</p>
                        </div>
                    </article>
                    <article class="campus-location" tabindex="0" data-location="Library" data-description="Find a quiet study space and campus references.">
                        <i class="fa-solid fa-book-open" aria-hidden="true"></i>
                        <div>
                            <h3>Library</h3>
                            <p>Find a quiet study space and campus references.</p>
                        </div>
                    </article>
                    <article class="campus-location" tabindex="0" data-location="Cafeteria" data-description="Take a break and find food near the student areas.">
                        <i class="fa-solid fa-utensils" aria-hidden="true"></i>
                        <div>
                            <h3>Cafeteria</h3>
                            <p>Take a break and find food near the student areas.</p>
                        </div>
                    </article>
                    <article class="campus-location" tabindex="0" data-location="Activity Court" data-description="Locate the basketball court and open campus spaces.">
                        <i class="fa-solid fa-basketball" aria-hidden="true"></i>
                        <div>
                            <h3>Activity Areas</h3>
                            <p>Locate the basketball court and open campus spaces.</p>
                        </div>
                    </article>
                </div>
            </section>
        </div>
    </div>

    <!-- Back button -->
    <a href="index.php" class="back-btn">
        <i class="fa-solid fa-arrow-left"></i>
        <span>Back to Home</span>
    </a>

    <!-- Chatbot — fixed, not draggable here -->
    <div class="nav-chatbot-panel" id="navChatbotPanel">
        <div class="nav-chatbot-header">
            <div class="chatbot-title">
                <i class="fa-solid fa-robot"></i>
                <span>Campus Assistant</span>
            </div>
            <button class="nav-chatbot-minimize" id="navChatbotMinimize" aria-label="Minimize Campus Assistant" aria-expanded="true">
                <i class="fa-solid fa-minus"></i>
            </button>
        </div>
        <div class="nav-chatbot-messages" id="navChatbotMessages"></div>
        <div class="nav-quick-replies" id="navQuickReplies"></div>
        <div class="nav-chatbot-input-wrap">
            <input type="text" id="navChatbotInput" placeholder="Type your answer...">
            <button class="nav-chatbot-send" id="navChatbotSend">
                <i class="fa-solid fa-paper-plane"></i>
            </button>
        </div>
    </div>

    <!-- Minimized chatbot tab -->
    <button class="nav-chatbot-tab" id="navChatbotTab" aria-label="Open Campus Assistant" aria-expanded="false">
        <i class="fa-solid fa-robot"></i>
        <span>Campus Assistant</span>
    </button>

    <script src="js/navigation.js"></script>
</body>
</html>