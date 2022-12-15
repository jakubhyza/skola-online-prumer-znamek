let table;
let y = [];
let x = [];

function ZobrazitPrumer()
{
	//Uložení tabulky do promněných
	table = document.querySelector('#G_ctl00xmainxCCADynamicUWGrid tbody');
	y = table.querySelectorAll('tr');

	var nejlepsiPredmet = '{NULL}';
	var nejlepsiPrumer = 5;

	var nejhrosiPredmet = '{NULL}';
	var nejhrosiPrumer = 0;

	var GlobalPrumer = 0;
	var GlobalTemp = 0;

	for (i = 0; i < y.length; i++)
	{
		x[i] = y[i].querySelectorAll('td');
	}
	
	//Vypsání vah známek
	x[0][0].innerHTML = 'Typ hodnocení:';
	x[1][0].innerHTML = 'Váha hodnocení:';
	for (i = 0; i < x[0].length; i++)
	{
		
		if (x[0][i].innerHTML != 'Uz.' && x[0][i].getAttribute('title') != null)
			x[1][i].innerHTML = x[0][i].getAttribute('title').replace('Váha[','').replace(']','').replace(',','.');
	}
	
	//výpočet
	
	for (i = 3; i < x.length; i++)
	{
		let znamka = 0;
		let temp = 0;
		for (y = 1; y < x[i].length; y++)
		{
			if (x[0][y].innerHTML != 'Uz.')
			{
				let vaha = parseFloat(x[1][y].innerHTML);
				let title = x[i][y].title;
				if (title == null || title.trim() == '')
					continue

				// zpracovani znamek v "title" bunky
				let znamky = title.trim().split(" ");

				for (z = 0; z < znamky.length; z++)
				{
					if (znamky[z] != '-' && znamky[z] != null && znamky[z] != '[S]')
					{
						znamka += (parseFloat(znamky[z].replace('-','.5')) * vaha);
						temp += vaha;
					}
				}

				// zpracovani simulovanych znamek
				let znamky_sim = x[i][y].querySelectorAll('span.simulace');

				for (z = 0; z < znamky_sim.length; z++)
				{
					if (znamky_sim[z].innerHTML != '-' && znamky_sim[z].innerHTML != null && znamky_sim[z].innerHTML != '[S]')
					{
						znamka += (parseFloat(znamky_sim[z].innerHTML.replace('-','.5')) * vaha);
						temp += vaha;
					}
				}
			}
		}
		
		//Zobrazení
		if (znamka != 0 && temp != 0)
			znamka = znamka / temp;

		if (znamka < 1)
			color = '808080';
		else if (znamka < 1.5)
			color = '00800d';
		else if (znamka < 2.5)
			color = '00E91C';
		else if (znamka < 3.5)
			color = 'FFD800';
		else if (znamka < 4.5)
			color = 'ff6000';
		else
			color = 'FF0000';

		x[i][0].innerHTML = ' <span class="prumer" style="color: #' + color + '">[' + znamka.toFixed(2) + ']</span> '  + x[i][0].getAttribute('title');

		//Statistiky
		if (znamka <= nejlepsiPrumer && znamka >= 1)
		{
			nejlepsiPrumer = znamka;
			nejlepsiPredmet = x[i][0].getAttribute('title');
		}
		if (znamka >= nejhrosiPrumer || znamka == 5)
		{
			nejhrosiPrumer = znamka;
			nejhrosiPredmet = x[i][0].getAttribute('title');
		}

		GlobalPrumer += (znamka.toFixed(0) - 0);
		GlobalTemp++;
	}

	//Zobrazit statistiky
	document.querySelector('.labInfo').innerText = "Nejlepší známku máš z "+nejlepsiPredmet+"\nNejhorší známku máš z "+nejhrosiPredmet;

	if (GlobalTemp != 0)
			GlobalPrumer = GlobalPrumer / GlobalTemp;

	if (GlobalPrumer < 1.5)
	{
		document.querySelector('.labInfo').innerText += "\nPrůměr ti vychází na vyznamenání ("+GlobalPrumer.toFixed(2)+")";

		if (nejhrosiPrumer >= 2.5)
			document.querySelector('.labInfo').innerText += ", ale kazí ti to " + nejhrosiPredmet;
		else
			document.querySelector('.labInfo').innerText += "!";
	}
	else
		document.querySelector('.labInfo').innerText += '\nCelkový průměr (' + GlobalPrumer.toFixed(2) + ')';

	console.log(GlobalPrumer);

}

function sim()
{
	let string = 'Zvolte číslo předmětu:';
	for (i = 2; i < x.length; i++)
	{
		string += '\n[' + (i - 2) + '] ' + x[i][0].getAttribute('title');
	}
	let predmet = prompt(string);
	if (!isNaN(predmet))
	{
		predmet = parseInt(predmet);
		predmet += 2;
		if (predmet >= 2 && predmet <= x.length - 1)
		{
			string = 'Zvolte sekci:';
			for (i = 1; i < x[0].length - 2; i++)
			{
				if (x[0][i].innerHTML != 'Uz.')
					string += '\n[' + i + '] ' + x[0][i].innerHTML;
			}
			let sekce = prompt(string);
			if (!isNaN(sekce))
			{
				if (sekce >= 1 && sekce <= x[0].length)
				{
					let z = prompt('Zvolte známku');
					if (!isNaN(z))
					{
						if (z > 0 && z < 6)
						{
							x[predmet][sekce].innerHTML += '<span title="Simulovaná známka\nKliknutím známku odstraníte." class="simulace" onclick="this.remove(); document.querySelector(\'#rfrsh\').click();">' + z + '</span>';
							ZobrazitPrumer();
						}
						else
							alert('Neplatná známka');
					}
					else
						alert('Neplatný vstup');
				}
				else
					alert('Tato sekce neexistuje');
			}
			else
				alert('Neplatný vstup');
		}
		else
			alert('Tento předmět neexistuje !');
	}
	else
		alert('Chybný vstup !');
}

if (window.location.href.includes('HodnVypisStud'))
{
	document.querySelector('.sol-btn-panel').innerHTML += '<br><span class="labInfo"></span><br><span class="btnSimulace"><a>Simulovat známky</a></span><span id="rfrsh" style="display: none;">X</span><br><br><a href="https://github.com/jakubhyza/skola-online-prumer-znamek" target="_blank">GitHub průměru známek</a>';
	document.querySelector('.btnSimulace').onclick = sim;
	document.querySelector('#rfrsh').onclick = ZobrazitPrumer;
	document.querySelector('style').innerHTML += '.prumer {color: #63518f; font-weight: bold;} .btnSimulace {color: #63518f; cursor: pointer;} .simulace {color: #FF9800;font-weight: bold; cursor: pointer; margin: 2px;}';
	ZobrazitPrumer();
}