import React from 'react'
import Modell from './model/Shopping'
import GruppenTag from './components/GruppenTag'
import GruppenDialog from './components/GruppenDialog'
import SortierDialog from './components/SortierDialog'

/**
 * @version 1.0
 * @author André Luft <a.luft1976@gmail.com>
 * @description Diese App ist eine Einkaufsliste mit React.js und separatem Model, welche Offline verwendet werden kann.
 * @ziel Diese App weiter zu entwickeln zu einer elementaren Inventar-App. Wer kennt es nicht..?
 *       Man(n), oder auch Frau geht einkaufen und man sieht mal wieder ein Schnäppchen..! Nun denn, wie wäre es da
 *       mit einer mobilen App, in der ich nachschlagen könnte, ob ich das Schnäppchen brauche, oder ob ich es nicht
 *       doch schon in meinem Besitz habe.Das Ganze lässt sich wunderbar mit einer Einkaufslisten-App kombinieren.
 *       Allgemein finde ich so etwas in dieser Richtung ganz hilfreich, da man z.B. seinen ganzen Besitz in der App
 *       spiegeln kann, im Falle von Naturkatastrophen, Einbruch, oder Diebstahl, um dieses ggf seiner/ihrer
 *       Versicherung zu melden. Wir wollen mal sehen, was die Zukunft so bringt.
 *       Bedanken möchte ich mich ganz herzlich bei Coach Alfred und allen Tutoren, insbesondere Joshua Scherer,
 *       Brian Moyou, Emily Sali und natürlich Viktoria Brandes, für die tatkräftige Unterstützung, auch wenn es
 *       manchmal nicht so einfach war.
 * @license Gnu Public Lesser License 3.0
 *
 */

class App extends React.Component {
	constructor ( props ) {
		super ( props )
		this.initialisieren =
			this.state = {
				aktiveGruppe : null ,
				showGruppenDialog : false ,
				showSortierDialog : false ,
				einkaufenAufgeklappt : true ,
				erledigtAufgeklappt : true
			}
	}
	
	componentDidMount () {
		Modell.laden ()
		// Auf-/Zu-Klapp-Zustand aus dem LocalStorage laden
		let einkaufslisteAufgeklappt = localStorage.getItem ( "einkaufslisteAufgeklappt" )
		einkaufslisteAufgeklappt = ( einkaufslisteAufgeklappt == null ) ? true : JSON.parse ( einkaufslisteAufgeklappt )
		
		let schongekauftAufgeklappt = localStorage.getItem ( "schongekauftAufgeklappt" )
		schongekauftAufgeklappt = ( schongekauftAufgeklappt == null ) ? false : JSON.parse ( schongekauftAufgeklappt )
		
		this.setState ( {
			aktiveGruppe : Modell.aktiveGruppe ,
			einkaufslisteAufgeklappt : einkaufslisteAufgeklappt ,
			schongekauftAufgeklappt : schongekauftAufgeklappt
		} )
	}
	
	einkaufenAufZuKlappen () {
		const neuerZustand = ! this.state.einkaufenAufgeklappt
		localStorage.setItem ( "einkaufenAufgeklappt" , neuerZustand )
		this.setState ( { einkaufenAufgeklappt : neuerZustand } )
	}
	
	erledigtAufZuKlappen () {
		const neuerZustand = ! this.state.erledigtAufgeklappt
		localStorage.setItem ( "erledigtAufgeklappt" , neuerZustand )
		this.setState ( { erledigtAufgeklappt : neuerZustand } )
	}
	
	lsLoeschen () {
		if ( window.confirm ( "Wollen Sie wirklich alles löschen?!" ) ) {
			localStorage.clear ()
		}
	}
	
	/**
	 * Hakt einen Artikel ab oder reaktiviert ihn
	 * @param {Artikel} artikel - der aktuelle Artikel, der gerade abgehakt oder reaktiviert wird
	 */
	artikelChecken = ( artikel ) => {
		artikel.gekauft = ! artikel.gekauft
		const aktion = ( artikel.gekauft ) ? "erledigt" : "reaktiviert"
		Modell.informieren ( "[App] Artikel \"" + artikel.name + "\" wurde " + aktion )
		this.setState ( this.state )
	}
	
	artikelHinzufuegen () {
		const eingabe = document.getElementById ( "artikelEingabe" )
		const artikelName = eingabe.value.trim ()
		console.debug ( artikelName )
		if ( artikelName.length > 0 ) {
			Modell.aktiveGruppe.artikelHinzufuegen ( artikelName )
			this.setState ( this.state )
		}
		eingabe.value = ""
		eingabe.focus ()
	}
	
	
	/**
	 * Hakt einen Artikel ab oder reaktiviert ihn
	 * @param {Artikel} artikel - der aktuelle Artikel, der gerade abgehakt oder reaktiviert wird
	 */
	
	setAktiveGruppe ( gruppe ) {
		Modell.aktiveGruppe = gruppe
		Modell.informieren ( "[App] Gruppe \"" + gruppe.name + "\" ist nun aktiv" )
		this.setState ( { aktiveGruppe : Modell.aktiveGruppe } )
	}
	
	closeSortierDialog = ( reihenfolge , sortieren ) => {
		if ( sortieren ) {
			Modell.sortieren ( reihenfolge )
		}
		this.setState ( { showSortierDialog : false } )
	}
	
	render () {
		let nochZuKaufen = []
		if ( this.state.einkaufenAufgeklappt == true ) {
			for ( const gruppe of Modell.gruppenListe ) {
				nochZuKaufen.push ( <GruppenTag
					key={ gruppe.id }
					gruppe={ gruppe }
					gekauft={ false }
					aktiv={ gruppe == this.state.aktiveGruppe }
					aktiveGruppeHandler={ () => this.setAktiveGruppe ( gruppe ) }
					checkHandler={ this.artikelChecken }/> )
			}
		}
		let schonGekauft = []
		if ( this.state.erledigtAufgeklappt == true ) {
			for ( const gruppe of Modell.gruppenListe ) {
				schonGekauft.push ( <GruppenTag
					key={ gruppe.id }
					gruppe={ gruppe }
					gekauft={ true }
					aktiveGruppeHandler={ () => this.setAktiveGruppe ( gruppe ) }
					checkHandler={ this.artikelChecken }/> )
			}
		}
		let gruppenDialog = ""
		if ( this.state.showGruppenDialog ) {
			gruppenDialog = <GruppenDialog
				gruppenListe={ Modell.gruppenListe }
				onDialogClose={ () => this.setState ( { showGruppenDialog : false } ) }/>
		}
		let sortierDialog = ""
		if ( this.state.showSortierDialog ) {
			sortierDialog = <SortierDialog onDialogClose={ this.closeSortierDialog }/>
		}
		return (
			<div id="container">
				<header>
					<h1>Inventar- & Einkaufsliste</h1>
					<label
						className="mdc-text-field mdc-text-field--filled mdc-text-field--with-trailing-icon mdc-text-field--no-label">
						<span className="mdc-text-field__ripple"></span>
						<input className="mdc-text-field__input" type="search"
						       id="artikelEingabe" placeholder="Artikel hinzufügen"
						       onKeyPress={ e => ( e.key == 'Enter' ) ? this.artikelHinzufuegen () : '' }/>
						<span className="mdc-line-ripple"></span>
						<i className="material-icons mdc-text-field__icon mdc-text-field__icon--trailing"
						   tabIndex="0" role="button"
						   onClick={ () => this.artikelHinzufuegen () }>add_circle</i>
					</label>
				</header>
				<hr/>
				<main>
					<section>
						<h2>Noch zu kaufen
							<i onClick={ () => this.einkaufenAufZuKlappen () } className="material-icons">
								{ this.state.einkaufenAufgeklappt ? 'expand_more' : 'expand_less' }
							</i>
						</h2>
						<dl>
							{ nochZuKaufen }
						</dl>
					</section>
					<hr/>
					<section>
						<h2>Schon gekauft
							<i onClick={ () => this.erledigtAufZuKlappen () } className="material-icons">
								{ this.state.erledigtAufgeklappt ? 'expand_more' : 'expand_less' }
							</i>
						</h2>
						<dl>
							{ schonGekauft }
						</dl>
					</section>
					<hr/>
				</main>
				<footer>
					<button className="mdc-button mdc-button--raised"
					        onClick={ () => this.setState ( { showGruppenDialog : true } ) }>
						<span className="material-icons">bookmark_add</span>
						<span className="mdc-button__ripple"></span> Gruppen
					</button>
					<button className="mdc-button mdc-button--raised"
					        onClick={ () => this.setState ( { showSortierDialog : true } ) }>
						<span className="material-icons">sort</span>
						<span className="mdc-button__ripple"></span> Sort
					</button>
					<button className="mdc-button mdc-button--raised"
					        onClick={ this.lsLoeschen }>
						<span className="material-icons">clear_all</span>
						<span className="mdc-button__ripple"></span> Clear
					</button>
				</footer>
				
				{ gruppenDialog }
				{ sortierDialog }
			</div>
		)
	}
}

export default App
