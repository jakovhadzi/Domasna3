const dolzinaNaTraka = 4.927;
const srednoVreme = 115;

const vkupnoKrugovi = 10;
const vremeSafetyCar = 20;
const vremePitStop = 20;

const poeniPozicija = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

var momentalenKrug = 0;
var safetyCar = false;
var incidenti = [];
var nastani = [];

function Driver(ime, tim, bazicnaBrzina, bazicnaVestina, vremeKrug, vremeSekundi, gumi, sudir, pitStop) {
    this.ime = ime;
    this.tim = tim;
    this.bazicnaBrzina = bazicnaBrzina;
    this.bazicnaVestina = bazicnaVestina;
    this.vremeKrug = vremeKrug;
    this.vremeSekundi = vremeSekundi;
    this.gumi = gumi;
    this.sudir = sudir;
    this.pitStop = pitStop;

    this.krugoviSoMomentalniGumi = 0;
    this.status = "";
    this.startPozicija = 0;
    this.poeni = 0;
    this.lapSekundi = 0;
}

const drivers = [
    new Driver("Kimi ANTONELLI", "Mercedes", 194, 99, "0:00.000", 0, "hard", false, false),
    new Driver("Lewis HAMILTON", "Ferrari", 193, 75, "0:00.000", 0, "hard", false, false),
    new Driver("Max VERSTAPPEN", "Red Bull", 195, 80, "0:00.000", 0, "hard", false, false),
    new Driver("Oscar PIASTRI", "McLaren", 193, 85, "0:00.000", 0, "hard", false, false),
    new Driver("Liam LAWSON", "Racing Bulls", 192, 55, "0:00.000", 0, "hard", false, false),
    new Driver("Pierre GASLY", "Alpine", 192, 45, "0:00.000", 0, "hard", false, false),
    new Driver("Esteban OCON", "Haas", 190, 50, "0:00.000", 0, "hard", false, false),
    new Driver("Nico HULKENBERG", "Audi", 192, 55, "0:00.000", 0, "hard", false, false),
    new Driver("Carlos SAINZ", "Williams", 195, 70, "0:00.000", 0, "hard", false, false),
    new Driver("Fernando ALONSO", "Aston Martin", 188, 60, "0:00.000", 0, "hard", false, false),
    new Driver("Valtteri BOTTAS", "Cadillac", 192, 57, "0:00.000", 0, "hard", false, false)
];

function presmetajKrug(vozac) {
    var opsegNaVarijacija = (100 - vozac.bazicnaVestina) / 40;
    var varijacija = (Math.random() * (opsegNaVarijacija * 2)) - opsegNaVarijacija;

    var vremeOdBrzina = (dolzinaNaTraka / vozac.bazicnaBrzina) * 3600;

    var krugSekundi = vremeOdBrzina + (100 - vozac.bazicnaVestina) / 10 + varijacija;

    krugSekundi += efektNaGumi(vozac);

    return krugSekundi;
}

function efektNaGumi(vozac) {
    if(vozac.gumi == 'soft')
        return -1.0 + vozac.krugoviSoMomentalniGumi * 0.35;
    else
        return 0.0 + vozac.krugoviSoMomentalniGumi * 0.1;
}



function dodadiStatus(vozac, status) {
    if(vozac.status == "")
        vozac.status = status;
    else
        vozac.status = vozac.status + ", " + status;
}

function proveriPitStop(vozac) {
    if(momentalenKrug == 1)
        return false;
    if(vozac.pitStop == true)
        return false;
    if(momentalenKrug >= vkupnoKrugovi - 1)
        return true;

    var verojatnost;
    if(vozac.gumi == 'soft')
        verojatnost = vozac.krugoviSoMomentalniGumi * 0.1;
    else
        verojatnost = vozac.krugoviSoMomentalniGumi * 0.07;

    return Math.random() < verojatnost;
}

function napraviPitStop(vozac) {
    var vremeIzgubeno = Math.random() * 2 + vremePitStop;
    var stariGumi = (vozac.gumi == "soft") ? "Soft" : "Hard";

    vozac.gumi = (vozac.gumi == "soft") ? "hard" : "soft";
    vozac.krugoviSoMomentalniGumi = 0;
    vozac.pitStop = true;
    dodadiStatus(vozac, "PIT");

    var noviGumi = (vozac.gumi == "soft") ? "Soft" : "Hard";
    nastani.push(vozac.ime + " pitted: " + stariGumi + " -> " + noviGumi + " tyres (" + vremeIzgubeno.toFixed(1) + "s)");

    return vremeIzgubeno;
}

function formatirajVreme(krugSekundi) {
    var minuti = Math.floor(krugSekundi / 60);
    var sekundi = Math.floor(krugSekundi % 60);
    var stotinki = Math.floor((krugSekundi % 1) * 1000);

    var sekundiTekst = sekundi < 10 ? "0" + sekundi : sekundi;
    var stotinkiTekst = stotinki < 10 ? "00" + stotinki : (stotinki < 100 ? "0" + stotinki : stotinki);

    return minuti + ":" + sekundiTekst + "." + stotinkiTekst;
}

function vremeMomentalenKrug() {
    for(var i = 0; i < drivers.length; i++) {
        var vozac = drivers[i];
        vozac.status = "";

        if(vozac.sudir == true) {
            vozac.vremeKrug = "DNF";
            vozac.vremeSekundi = 999999;
            continue;
        }

        if(Math.random() < 0.005) {
            vozac.sudir = true;
            vozac.vremeKrug = "CRASH";
            vozac.vremeSekundi = 999999 - momentalenKrug * 1000;
            safetyCar = true;
            incidenti.push(vozac.ime + " crashed (DNF)");
            console.log(vozac.ime + " crashed.");
            continue;
        }

        var krugSekundi = presmetajKrug(vozac);

        var verojatnostZaIzvrtuvanje = 0.02 + (100 - vozac.bazicnaVestina) / 2000;
        if(Math.random() < verojatnostZaIzvrtuvanje) {
            var vremeIzgubeno = 4 + Math.random() * 5;
            krugSekundi += vremeIzgubeno;
            dodadiStatus(vozac, "SPINOUT");
            nastani.push(vozac.ime + " -> spinout (+" + vremeIzgubeno.toFixed(1) + "s)");
        }

        if(proveriPitStop(vozac))
            krugSekundi += napraviPitStop(vozac);
        else
            vozac.krugoviSoMomentalniGumi++;

        vozac.vremeSekundi += krugSekundi;
        vozac.lapSekundi = krugSekundi;
    }
}

function safetyCarFunc() {
    if(safetyCar == false)
        return;

    for(var i = 0; i < drivers.length; i++) {
        if(drivers[i].sudir == true)
            continue;
        drivers[i].vremeSekundi += vremeSafetyCar;
        drivers[i].lapSekundi += vremeSafetyCar;
        dodadiStatus(drivers[i], "SAFETYCAR");
    }

    incidenti.push("SAFETY CAR deployed (+" + vremeSafetyCar + "s to every driver)");
}

function formatirajVreminja() {
    for(var i = 0; i < drivers.length; i++) {
        if(drivers[i].sudir == false)
            drivers[i].vremeKrug = formatirajVreme(drivers[i].lapSekundi);
    }
}

function sortirajVozaci() {
    drivers.sort(sporediVreminja)
}

function sporediVreminja(prv, vtor) {
    return prv.vremeSekundi - vtor.vremeSekundi;
}

function updateTable() {
    var redovi = document.getElementsByTagName("tr");

    for(var i = 0; i < drivers.length; i++) {
        var vozac = drivers[i];
        var red = redovi[i + 1];

        var koloni = red.getElementsByTagName("td");

        koloni[2].innerHTML = vozac.ime + " (" + (vozac.gumi == "soft" ? "S" : "H") + ")";
        koloni[3].innerHTML = vozac.bazicnaBrzina + " km/h";
        koloni[4].innerHTML = vozac.bazicnaVestina + "";
        
        if(vozac.status != "")
            koloni[5].innerHTML = vozac.vremeKrug + " [" + vozac.status + "]";
        else
            koloni[5].innerHTML = vozac.vremeKrug;

        var slikaTim = koloni[1].getElementsByTagName("img")[0];
        if(vozac.tim == "Mercedes") {
            slikaTim.src = "images/mercedes.png";
            slikaTim.alt = "Mercedes F1 Logo";
            slikaTim.height = "25";
        }
        else if(vozac.tim == "Ferrari") {
            slikaTim.src = "images/ferrari.png";
            slikaTim.alt = "Ferrari F1 Logo";
            slikaTim.height = "25";
        }
        else if(vozac.tim == "Red Bull") {
            slikaTim.src = "images/redBull.png";
            slikaTim.alt = "Red Bull F1 Logo";
            slikaTim.height = "20";
        }
        else if(vozac.tim == "McLaren") {
            slikaTim.src = "images/mclaren.png";
            slikaTim.alt = "McLaren F1 Logo";
            slikaTim.height = "25";
        }
        else if(vozac.tim == "Racing Bulls") {
            slikaTim.src = "images/racingBulls.png";
            slikaTim.alt = "Racing Bulls F1 Logo";
            slikaTim.height = "25";
        }
        else if(vozac.tim == "Alpine") {
            slikaTim.src = "images/alpine.png";
            slikaTim.alt = "Alpine F1 Logo";
            slikaTim.height = "35";
        }
        else if(vozac.tim == "Haas") {
            slikaTim.src = "images/haas.png";
            slikaTim.alt = "Haas F1 Logo";
            slikaTim.height = "25";
        }
        else if(vozac.tim == "Audi") {
            slikaTim.src = "images/audi.png";
            slikaTim.alt = "Audi F1 Logo";
            slikaTim.height = "35";
        }
        else if(vozac.tim == "Williams") {
            slikaTim.src = "images/williams.png";
            slikaTim.alt = "Williams F1 Logo";
            slikaTim.height = "20";
        }
        else if(vozac.tim == "Aston Martin") {
            slikaTim.src = "images/astonMartin.png";
            slikaTim.alt = "Aston Martin F1 Logo";
            slikaTim.height = "45";
        }
        else if(vozac.tim == "Cadillac") {
            slikaTim.src = "images/cadillac.png";
            slikaTim.alt = "Cadillac F1 Logo";
            slikaTim.height = "17";
        }
    }
}

function dodadiNotifikacija(naslov, poraki) {
    var notifs = document.getElementById("notifs");

    var stari = notifs.getElementsByTagName("details");
    for(var i = 0; i < stari.length; i++)
        stari[i].removeAttribute("open");

    var dodadi = "<details open><summary>" + naslov + "</summary>";
    for(var i = 0; i < poraki.length; i++)
        dodadi += "<p>" + poraki[i] + "</p>";
    dodadi += "</details>";

    notifs.innerHTML = dodadi + notifs.innerHTML;
}

function pocetokNotifikacija() {
    var poraki = ["Drivers have taken their positions"];

    for(var i = 0; i < drivers.length; i++)
        poraki.push("P" + drivers[i].startPozicija + " - " + drivers[i].ime + " (" + drivers[i].tim + ")");

    document.getElementById("notifs").innerHTML = "";
    dodadiNotifikacija("Starting positions", poraki);
}

function updateNotifs(stariPozicii) {
    var poraki = [];

    for(var i = 0; i < incidenti.length; i++)
        poraki.push(incidenti[i]);

    var preminuvanja = [];
    for(var i = 0; i < drivers.length; i++) {
        if(drivers[i].sudir == true)
            continue;

        var staraPozI = stariPozicii.indexOf(drivers[i].ime);

        for(var j = i + 1; j < drivers.length; j++) {
            if(drivers[j].sudir == true)
                continue;

            var staraPozJ = stariPozicii.indexOf(drivers[j].ime);
            if(staraPozJ < staraPozI) {
                var poraka = drivers[i].ime + " passed " + drivers[j].ime;
                if(drivers[j].status.indexOf("PIT") != -1)
                    poraka += " (" + drivers[j].ime + " was in box)";
                else if(drivers[j].status.indexOf("SPIN") != -1)
                    poraka += " (" + drivers[j].ime + " spun out)";
                preminuvanja.push(poraka);
            }
        }
    }

    for(var i = 0; i < preminuvanja.length; i++)
        poraki.push(preminuvanja[i]);

    for(var i = 0; i < nastani.length; i++)
        poraki.push(nastani[i]);

    if(drivers[0].sudir == false && drivers[1].sudir == false) {
        var razlika = drivers[1].vremeSekundi - drivers[0].vremeSekundi;
        poraki.push(drivers[0].ime + " leads " + drivers[1].ime + " -> +" + razlika.toFixed(3) + "s");
    }

    var naslov = "Lap" + momentalenKrug + "/" + vkupnoKrugovi;
    if(momentalenKrug == vkupnoKrugovi)
        naslov += " - Final lap";

    dodadiNotifikacija(naslov, poraki);
}

function krajNaTrka() {
    var poraki = [];

    if(drivers[0].sudir == false)
        poraki.push("WINNER: " + drivers[0].ime + " (" + drivers[0].tim + ")");

    for(var i = 0; i < drivers.length; i++) {
        var vozac = drivers[i];

        if(vozac.sudir == true) {
            vozac.poeni = 0;
            poraki.push("DNF - " + vozac.ime + " - 0 pts");
        }
        else {
            vozac.poeni = i < poeniPozicija.length ? poeniPozicija[i] : 0;
            poraki.push("P" + (i + 1) + " - " + vozac.ime + " " + vozac.poeni + " pts");
        }
    }

    dodadiNotifikacija("Race finished", poraki);
}

function slikaNaVozac(ime) {
    if(ime == "Kimi ANTONELLI")
        return "images/drivers/antonelli.png";
    else if(ime == "Lewis HAMILTON")
        return "images/drivers/hamilton.png";
    else if(ime == "Max VERSTAPPEN") 
        return "images/drivers/verstappen.png";
    else if(ime == "Oscar PIASTRI") 
        return "images/drivers/piastri.png";
    else if(ime == "Liam LAWSON") 
        return "images/drivers/lawson.png";
    else if(ime == "Pierre GASLY") 
        return "images/drivers/gasly.png";
    else if(ime == "Esteban OCON") 
        return "images/drivers/ocon.png";
    else if(ime == "Nico HULKENBERG") 
        return "images/drivers/hulkenberg.png";
    else if(ime == "Carlos SAINZ") 
        return "images/drivers/sainz.png";
    else if(ime == "Fernando ALONSO") 
        return "images/drivers/alonso.png";
    else if(ime == "Valtteri BOTTAS") 
        return "images/drivers/bottas.png";
}

function postaviPodium() {
    for(var i = 0; i < 3; i++) {
        var slika = document.getElementById("p" + (i + 1));
        if(drivers[i].sudir == true)
            continue;
        slika.src = slikaNaVozac(drivers[i].ime);
        slika.alt = drivers[i].ime;
    }
}

function kvalifikacii() {
    for(var i = 0; i < drivers.length; i++) {
        drivers[i].gumi = Math.random() < 0.5 ? "soft" : "hard";
        drivers[i].vremeSekundi = presmetajKrug(drivers[i]);
    }

    sortirajVozaci();

    for(var i = 0; i < drivers.length; i++) {
        drivers[i].startPozicija = i + 1;
        drivers[i].vremeSekundi = i * 0.3;
        drivers[i].vremeKrug = "0:00.000";
        drivers[i].krugoviSoMomentalniGumi = 0;
    }
}

function sledenKrug() {
    if(momentalenKrug >= vkupnoKrugovi)
        return;

    momentalenKrug++;

    var stariPozicii = [];
    for(var i = 0; i < drivers.length; i++)
        stariPozicii.push(drivers[i].ime);

    incidenti = [];
    nastani = [];
    safetyCar = false;

    vremeMomentalenKrug();
    safetyCarFunc();
    formatirajVreminja();
    sortirajVozaci();
    for(var i = 0; i < drivers.length; i++)
        console.log(drivers[i].ime + " -> " + drivers[i].vremeKrug);
    updateTable();

    document.getElementById("activeLap").innerHTML = momentalenKrug;
    updateNotifs(stariPozicii);

    var kopce = document.getElementById("nextLap");
    if(momentalenKrug == vkupnoKrugovi) {
        krajNaTrka();
        postaviPodium();
        kopce.innerHTML = "Race finished";
        kopce.disabled = true;
    }
    else
        kopce.innerHTML = "Next lap - " + (momentalenKrug + 1) + "/" + vkupnoKrugovi;
}

function start(){
    kvalifikacii();
    for(var i = 0; i < drivers.length; i++)
        console.log("P" + (i + 1) + " " + drivers[i].ime);
    updateTable();
    pocetokNotifikacija();

    document.getElementById("nextLap").addEventListener("click", sledenKrug, false);
}

window.addEventListener("load", start, false);