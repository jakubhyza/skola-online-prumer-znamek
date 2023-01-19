let table;
let y = [];
const x = [];
const HEADER_OFFSET = 2;

const IGNORED_COLUMNS = [
	'Uz.',
	'Celkový průměr'
];

const IGNORED_SPECIAL_MARKS = [
	'-',
	'[S]',
	'x',
];

function ZobrazitPrumer() {
	//Uložení tabulky do promněných
	table = document.querySelector('#G_ctl00xmainxCCADynamicUWGrid tbody');
	y = table.querySelectorAll('tr');

	var nejlepsiPredmet = '{NULL}';
	var nejlepsiPrumer = 5;

	var nejhorsiPredmet = '{NULL}';
	var nejhorsiPrumer = 0;

	var GlobalPrumer = 0;
	var GlobalTemp = 0;

	for (i = 0; i < y.length; i++) {
		x[i] = y[i].querySelectorAll('td');
	}

	//Vypsání vah známek
	x[0][0].innerHTML = 'Typ hodnocení:';
	x[1][0].innerHTML = 'Váha hodnocení:';
	for (i = 0; i < x[0].length; i++) {
		if (!IGNORED_COLUMNS.includes(x[0][i].innerHTML) && x[0][i].title !== null) {
			x[1][i].innerHTML = x[0][i].title.replace('Váha[','').replace(']','').replace(',','.');
		}
	}

	//výpočet
	for (i = 3; i < x.length; i++) {
		let znamka = 0;
		let temp = 0;
		for (y = 1; y < x[i].length; y++) {
			if (IGNORED_COLUMNS.includes(x[0][y].innerHTML)) {
				continue;
			}

			let vaha = parseFloat(x[1][y].innerHTML);
			let title = x[i][y].title;

			// zpracovani znamek v "title" bunky
			let znamky = title.trim().split(" ");

			if (title === null || title.trim() === '')
				znamky = [];

			for (z = 0; z < znamky.length; z++)	{
				if (!znamky[z]) {
					continue;
				}
				if (IGNORED_SPECIAL_MARKS.includes(znamky[z])) {
					continue;
				}

				znamka += (parseFloat(znamky[z].replace(',','.')) * vaha);
				temp += vaha;
			}

			// zpracovani simulovanych znamek
			let znamky_sim = x[i][y].querySelectorAll('span.simulace');

			for (z = 0; z < znamky_sim.length; z++)	{
				if (IGNORED_SPECIAL_MARKS.includes(znamky_sim[z])) {
					continue;
				}

				znamka += (parseFloat(znamky_sim[z].innerHTML.replace(',','.')) * vaha);
				temp += vaha;
			}
		}

		//Zobrazení
		if (znamka !== 0 && temp !== 0) {
			znamka = znamka / temp;
		}

		const colors = {
			1: '808080',
			1.5: '00800d',
			2.5: '00E91C',
			3.5: 'FFD800',
			4.5: 'ff6000',
		};

		color = 'FF0000';
		for(const [meze, barva] of Object.entries(colors)) {
			if (znamka < meze) {
				color = barva;
				break;
			}
		}

		x[i][0].innerHTML = ' <span class="prumer" style="color: #' + color + '">[' + znamka.toFixed(2) + ']</span> '  + x[i][0].title;

		//Statistiky
		if (znamka <= nejlepsiPrumer && znamka >= 1) {
			nejlepsiPrumer = znamka;
			nejlepsiPredmet = x[i][0].title;
		}

		if (znamka >= nejhorsiPrumer || znamka === 5) {
			nejhorsiPrumer = znamka;
			nejhorsiPredmet = x[i][0].title;
		}

		GlobalPrumer += Math.round(znamka);
		GlobalTemp++;
	}

	//Zobrazit statistiky
	document.querySelector('.labInfo').innerText = "Nejlepší známku máš z "+nejlepsiPredmet+"\nNejhorší známku máš z "+nejhorsiPredmet;

	if (GlobalTemp != 0) {
		GlobalPrumer = GlobalPrumer / GlobalTemp;
	}

	if (GlobalPrumer < 1.5)	{
		document.querySelector('.labInfo').innerText += "\nPrůměr ti vychází na vyznamenání ("+GlobalPrumer.toFixed(2)+")";

		if (nejhorsiPrumer >= 2.5) {
			document.querySelector('.labInfo').innerText += ", ale kazí ti to " + nejhorsiPredmet;
		} else {
			document.querySelector('.labInfo').innerText += "!";
		}
	} else {
		document.querySelector('.labInfo').innerText += '\nCelkový průměr (' + GlobalPrumer.toFixed(2) + ')';
	}

	//console.log(GlobalPrumer); // Debug info
}

function sim() {
	let string = 'Zvolte číslo předmětu:';
	for (i = 2; i < x.length; i++) {
		string += '\n[' + (i - 2) + '] ' + x[i][0].title;
	}

	let predmet = parseInt(prompt(string));
	if (isNaN(predmet)) {
		return alert('Chybný vstup !');
	}
	if (predmet < 1 || predmet > x.length - 1) {
		return alert('Tento předmět neexistuje !');
	}
	predmet += HEADER_OFFSET;

	string = 'Zvolte sekci:';
	for (i = 1; i < x[0].length - 2; i++) {
		if (!IGNORED_COLUMNS.includes(x[0][i].innerHTML)) {
			string += '\n[' + i + '] ' + x[0][i].innerHTML;
		}
	}

	let sekce = prompt(string);
	if (isNaN(sekce)) {
		return alert('Neplatný vstup');
	}
	if (sekce < 1 || sekce > x[0].length) {
		return alert('Tato sekce neexistuje');
	}

	let z = prompt('Zvolte známku');
	if (isNaN(z)) {
		return alert('Neplatný vstup');
	}
	if (z < 1 || z > 5) {
		return alert('Neplatná známka');
	}

	x[predmet][sekce].innerHTML += '<span title="Simulovaná známka\nKliknutím známku odstraníte." class="simulace" onclick="this.remove(); document.querySelector(\'#rfrsh\').click();">' + z + '</span>';
	ZobrazitPrumer();
}

if (window.location.href.includes('HodnVypisStud')) {
	document.querySelector('.sol-btn-panel').innerHTML += '<br><span class="labInfo"></span><br><span class="btnSimulace"><a>Simulovat známky</a></span><span id="rfrsh" style="display: none;">X</span><br><br><a href="https://github.com/jakubhyza/skola-online-prumer-znamek" target="_blank">GitHub průměru známek</a>';
	document.querySelector('.btnSimulace').onclick = sim;
	document.querySelector('#rfrsh').onclick = ZobrazitPrumer;
	document.querySelector('style').innerHTML += '.prumer {color: #63518f; font-weight: bold;} .btnSimulace {color: #63518f; cursor: pointer;} .simulace {color: #FF9800;font-weight: bold; cursor: pointer; margin: 2px;}';
	ZobrazitPrumer();
}
