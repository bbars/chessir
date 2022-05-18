import Coord from '../Coord.js';
import Move from '../Move.js';
import Game from '../Game.js';
import * as pieces from '../pieces/index.js';

const tplBoard = document.createElement('template');
tplBoard.innerHTML = `
	<style>
	:host {
		all: initial;
		display: inline-block;
		font: inherit;
		background: #fff;
		border: 1px inset;
		border-radius: 2px;
		width: 10em;
		
		--transition-duration: 0.3s;
	}
	:host #elRoot {
		display: block;
		width: 100%;
		height: 100%;
	}
	
	:host [data-a="a"] { x: 0; cx: 0; }
	:host [data-a="b"] { x: 1; cx: 1; }
	:host [data-a="c"] { x: 2; cx: 2; }
	:host [data-a="d"] { x: 3; cx: 3; }
	:host [data-a="e"] { x: 4; cx: 4; }
	:host [data-a="f"] { x: 5; cx: 5; }
	:host [data-a="g"] { x: 6; cx: 6; }
	:host [data-a="h"] { x: 7; cx: 7; }
	:host [data-n="8"] { y: 0; cy: 0; }
	:host [data-n="7"] { y: 1; cy: 1; }
	:host [data-n="6"] { y: 2; cy: 2; }
	:host [data-n="5"] { y: 3; cy: 3; }
	:host [data-n="4"] { y: 4; cy: 4; }
	:host [data-n="3"] { y: 5; cy: 5; }
	:host [data-n="2"] { y: 6; cy: 6; }
	:host [data-n="1"] { y: 7; cy: 7; }
	
	:host([swap]) [data-a="a"] { x: 7; cx: 7; }
	:host([swap]) [data-a="b"] { x: 6; cx: 6; }
	:host([swap]) [data-a="c"] { x: 5; cx: 5; }
	:host([swap]) [data-a="d"] { x: 4; cx: 4; }
	:host([swap]) [data-a="e"] { x: 3; cx: 3; }
	:host([swap]) [data-a="f"] { x: 2; cx: 2; }
	:host([swap]) [data-a="g"] { x: 1; cx: 1; }
	:host([swap]) [data-a="h"] { x: 0; cx: 0; }
	:host([swap]) [data-n="8"] { y: 7; cy: 7; }
	:host([swap]) [data-n="7"] { y: 6; cy: 6; }
	:host([swap]) [data-n="6"] { y: 5; cy: 5; }
	:host([swap]) [data-n="5"] { y: 4; cy: 4; }
	:host([swap]) [data-n="4"] { y: 3; cy: 3; }
	:host([swap]) [data-n="3"] { y: 2; cy: 2; }
	:host([swap]) [data-n="2"] { y: 1; cy: 1; }
	:host([swap]) [data-n="1"] { y: 0; cy: 0; }
	
	:host #elRoot.animated #elCoordLabels > * > *,
	:host #elRoot.animated #elArrows,
	:host #elRoot.animated #elPieces > * {
		transition: all var(--transition-duration) ease;
	}
	
	:host #elCheckerboard {
		
	}
	
	:host #elPieces {
		
	}
	
	:host #elPieces > [data-captured] {
		opacity: 0;
	}
	:host #elRoot.animated #elPieces > [data-captured] {
		transition: all calc(var(--transition-duration) * 8) ease;
	}
	:host #elPieces > [data-captured].white {
		y: -1;
	}
	:host #elPieces > [data-captured].black {
		y: +8;
	}
	
	:host #markerBlack {
		fill: #000;
	}
	:host #markerBlue {
		fill: #05f;
	}
	:host #markerRed {
		fill: #d33;
	}
	:host #elArrows {
		fill: none;
		stroke-width: 0.075px;
		stroke-linecap: round;
		stroke-linejoin: round;
		transform: translate(0.5px, 0.5px);
		transform-origin: 3.5px 3.5px;
		opacity: 0.65;
	}
	:host #elArrows > path {
		stroke: #000;
		marker-end: url(#markerBlack);
		/*transition: all var(--transition-duration) ease;*/
	}
	:host #elArrows > path.move {
		stroke: #05f;
		marker-end: url(#markerBlue);
	}
	:host #elArrows > path.attack {
		stroke: #d33;
		marker-end: url(#markerRed);
	}
	
	:host #elFrontDots {
		stroke: none;
		fill: #fff;
		stroke: #000;
		stroke-width: 0.025px;
	}
	:host #elFrontDots > circle {
		r: 0.1;
		opacity: 0.35;
	}
	:host #elFrontDots > circle.attack {
		stroke: #fff;
		fill: #d33;
		opacity: 1;
	}
	
	:host #elCoordLabels {
		font-size: 0.35px;
		user-select: none;
		mix-blend-mode: difference;
		fill: #fff;
		opacity: 0;
	}
	:host([labels]) #elCoordLabels {
		opacity: 0.5;
	}
	:host #elCoordLabels > .horz {
	}
	:host #elCoordLabels > .vert {
	}
	:host #elCoordLabels > .horz > * {
		transform: translate(0.5px, 0.575px);
		text-anchor: middle;
	}
	:host #elCoordLabels > .vert > * {
		transform: translate(0.5px, 0.625px);
		text-anchor: middle;
	}
	:host([labels="inside"]) #elCoordLabels {
		font-size: 0.25px;
		mix-blend-mode: unset;
		fill: #000;
	}
	:host([labels="inside"]) #elCoordLabels > .horz {
		transform: translate(+0.35px, +7.35px) !important;
	}
	:host([labels="inside"]) #elCoordLabels > .vert {
		transform: translate(-0.35px, -0.35px) !important;
	}
	:host([labels="inside"]) #elCoordLabels > :nth-child(2) ~ * {
		opacity: 0 !important;
	}
	
	:host #elCells > rect {
		width: 1px;
		height: 1px;
		fill: transparent;
		stroke: transparent;
		stroke-width: 0.025px;
		transform: translate(-0.5px, -0.5px);
		cursor: pointer;
	}
	
	:host #elCells > rect:hover {
		stroke: #fff;
		/*fill: rgba(127,127,127, 0.5);*/
	}
	
	:host #elCells ~ * {
		pointer-events: none;
	}
	
	:host .overlay {
		transform: translate(0.5px, 0.5px) !important;
	}
	:host .overlay.swappable {
		transform: translate(0.5px, 0.5px) !important;
		transform-origin: 3.5px 3.5px;
	}
	:host([swap]) .overlay.swappable {
		transform: translate(0.5px, 0.5px) scale(-1) !important;
	}
	
	</style>
	<svg id="elRoot" class="animated" viewBox="-1 -1 10 10" preserveAspectRatio="xMidYMid" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink= "http://www.w3.org/1999/xlink">
		<defs>
			<g id="checkerboard">
				<path fill="moccasin" d="M0 0h8v8h-8v-8"/>
				<path fill="peru" d="M1 0h1v1h-1v-1 M3 0h1v1h-1v-1 M5 0h1v1h-1v-1 M7 0h1v1h-1v-1 M0 1h1v1h-1v-1 M2 1h1v1h-1v-1 M4 1h1v1h-1v-1 M6 1h1v1h-1v-1 M1 2h1v1h-1v-1 M3 2h1v1h-1v-1 M5 2h1v1h-1v-1 M7 2h1v1h-1v-1 M0 3h1v1h-1v-1 M2 3h1v1h-1v-1 M4 3h1v1h-1v-1 M6 3h1v1h-1v-1 M1 4h1v1h-1v-1 M3 4h1v1h-1v-1 M5 4h1v1h-1v-1 M7 4h1v1h-1v-1 M0 5h1v1h-1v-1 M2 5h1v1h-1v-1 M4 5h1v1h-1v-1 M6 5h1v1h-1v-1 M1 6h1v1h-1v-1 M3 6h1v1h-1v-1 M5 6h1v1h-1v-1 M7 6h1v1h-1v-1 M0 7h1v1h-1v-1 M2 7h1v1h-1v-1 M4 7h1v1h-1v-1 M6 7h1v1h-1v-1"/>
			</g>
			<marker id="markerBlack" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
				<path d="M0,1 L0.5,3 L0,5 L6,3.5 L6,2.5 z" />
				<!--path d="M0,1 L0,5 L7,3 z" fill="#000" /-->
			</marker>
			<marker id="markerBlue" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
				<path d="M0,1 L0.5,3 L0,5 L6,3.5 L6,2.5 z" />
			</marker>
			<marker id="markerRed" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
				<path d="M0,1 L0.5,3 L0,5 L6,3.5 L6,2.5 z" />
			</marker>
			<svg xmlns="http://www.w3.org/2000/svg" id="piece-K" --viewBox="-1 -1 +32 +32" viewBox="-3 -3 +36 +36" preserveAspectRatio="xMidYMid" fill="none"  stroke-linecap="round" stroke-linejoin="round" stroke="black" stroke-width="1.5"><path d="M15,4.96764706 L15,0"/><path d="M12.8571429,1.76470588 L17.1428571,1.76470588"/><path d="M17.5714286,7.5 C17.5714286,7.5 16.7142857,5.29411765 15,5.29411765 C13.2857143,5.29411765 12.4285714,7.5 12.4285714,7.5 C11.1428571,10.1470588 15,16.7647059 15,16.7647059 C15,16.7647059 18.8571429,10.1470588 17.5714286,7.5 Z" fill="white" fill-rule="nonzero"/><path d="M5.57142857,27.3529412 C10.2857143,30.4411765 18.8571429,30.4411765 23.5714286,27.3529412 L23.5714286,21.1764706 C23.5714286,21.1764706 31.2857143,17.2058824 28.7142857,11.9117647 C25.2857143,6.17647059 17.1428571,8.82352941 15,15.4411765 L15,18.5294118 L15,15.4411765 C12,8.82352941 3.85714286,6.17647059 1.28571429,11.9117647 C-1.28571429,17.2058824 5.57142857,20.7352941 5.57142857,20.7352941 L5.57142857,27.3529412 Z" fill="white" fill-rule="nonzero"/><path d="M5.57142857,21.1764706 C10.2857143,18.5294118 18.8571429,18.5294118 23.5714286,21.1764706"/><path d="M5.57142857,24.2647059 C10.2857143,21.6176471 18.8571429,21.6176471 23.5714286,24.2647059"/><path d="M5.57142857,27.3529412 C10.2857143,24.7058824 18.8571429,24.7058824 23.5714286,27.3529412"/></svg>
			<svg xmlns="http://www.w3.org/2000/svg" id="piece-Q" --viewBox="-1 -1 +36 +34" viewBox="-3 -3 +40 +38" preserveAspectRatio="xMidYMid" fill="none"  stroke-linecap="round" stroke-linejoin="round" stroke="black" stroke-width="1.5"><path d="M3.45945946,6.2 C3.45945946,7.17833299 2.68503308,7.97142857 1.72972973,7.97142857 C0.774426379,7.97142857 0,7.17833299 0,6.2 C0,5.22166701 0.774426379,4.42857143 1.72972973,4.42857143 C2.68503308,4.42857143 3.45945946,5.22166701 3.45945946,6.2 Z" fill="white"/><path d="M17.7297297,2.21428571 C17.7297297,3.1926187 16.9553034,3.98571429 16,3.98571429 C15.0446966,3.98571429 14.2702703,3.1926187 14.2702703,2.21428571 C14.2702703,1.23595273 15.0446966,0.442857143 16,0.442857143 C16.9553034,0.442857143 17.7297297,1.23595273 17.7297297,2.21428571 Z" fill="white"/><path d="M32,6.2 C32,7.17833299 31.2255736,7.97142857 30.2702703,7.97142857 C29.3149669,7.97142857 28.5405405,7.17833299 28.5405405,6.2 C28.5405405,5.22166701 29.3149669,4.42857143 30.2702703,4.42857143 C31.2255736,4.42857143 32,5.22166701 32,6.2 Z" fill="white"/><path d="M10.3783784,3.1 C10.3783784,4.07833299 9.603952,4.87142857 8.64864865,4.87142857 C7.6933453,4.87142857 6.91891892,4.07833299 6.91891892,3.1 C6.91891892,2.12166701 7.6933453,1.32857143 8.64864865,1.32857143 C9.603952,1.32857143 10.3783784,2.12166701 10.3783784,3.1 Z" fill="white"/><path d="M25.0810811,3.54285714 C25.0810811,4.52119013 24.3066547,5.31428571 23.3513514,5.31428571 C22.396048,5.31428571 21.6216216,4.52119013 21.6216216,3.54285714 C21.6216216,2.56452416 22.396048,1.77142857 23.3513514,1.77142857 C24.3066547,1.77142857 25.0810811,2.56452416 25.0810811,3.54285714 Z" fill="white"/><path d="M4.32432432,18.6 C11.6756757,17.2714286 22.4864865,17.2714286 27.6756757,18.6 L29.4054054,7.97142857 L23.3513514,17.7142857 L23.3513514,5.31428571 L18.5945946,17.2714286 L16,3.98571429 L13.4054054,17.2714286 L8.64864865,4.87142857 L8.64864865,17.7142857 L2.59459459,7.97142857 L4.32432432,18.6 Z" fill="white"/><path d="M4.32432432,18.6 C4.32432432,20.3714286 5.62162162,20.3714286 6.48648649,22.1428571 C7.35135135,23.4714286 7.35135135,23.0285714 6.91891892,25.2428571 C5.62162162,26.1285714 5.62162162,27.4571429 5.62162162,27.4571429 C4.32432432,28.7857143 6.05405405,29.6714286 6.05405405,29.6714286 C11.6756757,30.5571429 20.3243243,30.5571429 25.9459459,29.6714286 C25.9459459,29.6714286 27.2432432,28.7857143 25.9459459,27.4571429 C25.9459459,27.4571429 26.3783784,26.1285714 25.0810811,25.2428571 C24.6486486,23.0285714 24.6486486,23.4714286 25.5135135,22.1428571 C26.3783784,20.3714286 27.6756757,20.3714286 27.6756757,18.6 C20.3243243,17.2714286 11.6756757,17.2714286 4.32432432,18.6 Z" fill="white"/><path d="M6.48648649,22.1428571 C9.51351351,21.2571429 22.4864865,21.2571429 25.5135135,22.1428571"/><path d="M6.91891892,25.2428571 C12.1081081,24.3571429 19.8918919,24.3571429 25.0810811,25.2428571"/></svg>
			<svg xmlns="http://www.w3.org/2000/svg" id="piece-R" --viewBox="-6 -3 +34 +32" viewBox="-8 -5 +38 +36" preserveAspectRatio="xMidYMid" fill="none"  stroke-linecap="round" stroke-linejoin="round" stroke="black" stroke-width="1.5"><polygon fill="white" points="0 26 22 26 22 23.4 0 23.4"/><polygon fill="white" points="2.44444444 23.4 2.44444444 19.9333333 19.5555556 19.9333333 19.5555556 23.4"/><polyline fill="white" points="1.62962963 4.33333333 1.62962963 0 4.88888889 0 4.88888889 1.73333333 8.96296296 1.73333333 8.96296296 0 13.037037 0 13.037037 1.73333333 17.1111111 1.73333333 17.1111111 0 20.3703704 0 20.3703704 4.33333333"/><polyline fill="white" points="20.3703704 4.33333333 17.9259259 6.93333333 4.07407407 6.93333333 1.62962963 4.33333333"/><polyline fill="white" points="17.9259259 6.93333333 17.9259259 17.7666667 4.07407407 17.7666667 4.07407407 6.93333333"/><polyline fill="white" points="17.9259259 17.7666667 19.1481481 19.9333333 2.85185185 19.9333333 4.07407407 17.7666667"/><path d="M1.62962963,4.33333333 L20.3703704,4.33333333"/></svg>
			<svg xmlns="http://www.w3.org/2000/svg" id="piece-B" --viewBox="-3 -1 +34 +34" viewBox="-5 -3 +38 +38" preserveAspectRatio="xMidYMid" fill="none"  stroke-linecap="round" stroke-linejoin="round" stroke="black" stroke-width="1.5"><g fill="white" fill-rule="nonzero"><path d="M2.54545455,27.3529412 C5.42181818,26.4970588 11.1236364,27.7323529 14,25.5882353 C16.8763636,27.7323529 22.5781818,26.4970588 25.4545455,27.3529412 C25.4545455,27.3529412 26.8545455,27.8294118 28,29.1176471 C27.4230303,29.9735294 26.6,29.9911765 25.4545455,29.5588235 C22.5781818,28.7029412 16.8763636,29.9647059 14,28.6764706 C11.1236364,29.9647059 5.42181818,28.7029412 2.54545455,29.5588235 C1.39660606,29.9911765 0.574424242,29.9735294 0,29.1176471 C1.14884848,27.4058824 2.54545455,27.3529412 2.54545455,27.3529412 Z"/><path d="M7.63636364,23.8235294 C9.75757576,26.0294118 18.2424242,26.0294118 20.3636364,23.8235294 C20.7878788,22.5 20.3636364,22.0588235 20.3636364,22.0588235 C20.3636364,19.8529412 18.2424242,18.5294118 18.2424242,18.5294118 C22.9090909,17.2058824 23.3333333,8.38235294 14,4.85294118 C4.66666667,8.38235294 5.09090909,17.2058824 9.75757576,18.5294118 C9.75757576,18.5294118 7.63636364,19.8529412 7.63636364,22.0588235 C7.63636364,22.0588235 7.21212121,22.5 7.63636364,23.8235294 Z"/><path d="M16.1212121,2.64705882 C16.1212121,3.86533401 15.1715131,4.85294118 14,4.85294118 C12.8284869,4.85294118 11.8787879,3.86533401 11.8787879,2.64705882 C11.8787879,1.42878364 12.8284869,0.441176471 14,0.441176471 C15.1715131,0.441176471 16.1212121,1.42878364 16.1212121,2.64705882 Z"/></g><path d="M9.75757576,18.5294118 L18.2424242,18.5294118 M7.63636364,22.0588235 L20.3636364,22.0588235 M14,9.26470588 L14,13.6764706 M11.8787879,11.4705882 L16.1212121,11.4705882"/></svg>
			<svg xmlns="http://www.w3.org/2000/svg" id="piece-N" --viewBox="-2 -1 +32 +32" viewBox="-4 -3 +36 +36" preserveAspectRatio="xMidYMid" fill="none"  stroke-linecap="round" stroke-linejoin="round" stroke="black"><path d="M13.5757576,2.625 C22.4848485,3.5 27.5757576,9.625 27.1515152,28 L7.63636364,28 C7.63636364,20.125 16.1212121,22.3125 14.4242424,9.625" stroke-width="1.5" fill="white"/><path d="M15.2727273,9.625 C15.5951515,12.17125 10.5636364,16.07375 8.48484848,17.5 C5.93939394,19.25 6.09212121,21.2975 4.24242424,21 C3.35830303,20.1775 5.43878788,18.34 4.24242424,18.375 C3.39393939,18.375 4.40363636,19.45125 3.39393939,20.125 C2.54545455,20.125 -0.00254545455,21 0,16.625 C0,14.875 5.09090909,6.125 5.09090909,6.125 C5.09090909,6.125 6.69454545,4.4625 6.78787879,3.0625 C6.16848485,2.19275 6.36363636,1.3125 6.36363636,0.4375 C7.21212121,-0.4375 8.90909091,2.625 8.90909091,2.625 L10.6060606,2.625 C10.6060606,2.625 11.2678788,0.882 12.7272727,0 C13.5757576,0 13.5757576,2.625 13.5757576,2.625" stroke-width="1.5" fill="white"/><path d="M2.96969697,16.1875 C2.96969697,16.4291246 2.77975717,16.625 2.54545455,16.625 C2.31115192,16.625 2.12121212,16.4291246 2.12121212,16.1875 C2.12121212,15.9458754 2.31115192,15.75 2.54545455,15.75 C2.77975717,15.75 2.96969697,15.9458754 2.96969697,16.1875 Z" stroke-width="1.5" fill="black"/><path d="M7.6363543,7.4375 C7.6363543,8.16235779 7.44641868,8.74997112 7.21212121,8.74997112 C6.97782375,8.74997112 6.78788812,8.16235779 6.78788812,7.4375 C6.78788812,6.71264221 6.97782375,6.12502888 7.21212121,6.12502888 C7.44641868,6.12502888 7.6363543,6.71264221 7.6363543,7.4375 Z" stroke-width="1.499967" fill="black" transform="translate(7.212121, 7.437500) rotate(30.000728) translate(-7.212121, -7.437500) "/></svg>
			<svg xmlns="http://www.w3.org/2000/svg" id="piece-P" --viewBox="-5 -3 +30 +32" viewBox="-7 -5 +34 +36" preserveAspectRatio="xMidYMid" fill="white" stroke-linecap="round" stroke-linejoin="round" stroke="black" stroke-width="1.5" fill-rule="nonzero"><path d="M10,0 C8.15833333,0 6.66666667,1.50129032 6.66666667,3.35483871 C6.66666667,4.10129032 6.90833333,4.78903226 7.31666667,5.35096774 C5.69166667,6.29032258 4.58333333,8.04322581 4.58333333,10.0645161 C4.58333333,11.7670968 5.36666667,13.2851613 6.59166667,14.2832258 C4.09166667,15.1722581 0.416666667,18.9380645 0.416666667,25.5806452 L19.5833333,25.5806452 C19.5833333,18.9380645 15.9083333,15.1722581 13.4083333,14.2832258 C14.6333333,13.2851613 15.4166667,11.7670968 15.4166667,10.0645161 C15.4166667,8.04322581 14.3083333,6.29032258 12.6833333,5.35096774 C13.0916667,4.78903226 13.3333333,4.10129032 13.3333333,3.35483871 C13.3333333,1.50129032 11.8416667,0 10,0 Z"/></svg>
			<svg xmlns="http://www.w3.org/2000/svg" id="piece-k" --viewBox="-1 -1 +32 +32" viewBox="-3 -3 +36 +36" preserveAspectRatio="xMidYMid" fill="none"  stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M15,4.96764706 L15,0" stroke="black"/><path d="M15,16.7647059 C15,16.7647059 18.8571429,10.1470588 17.5714286,7.5 C17.5714286,7.5 16.7142857,5.29411765 15,5.29411765 C13.2857143,5.29411765 12.4285714,7.5 12.4285714,7.5 C11.1428571,10.1470588 15,16.7647059 15,16.7647059" stroke="black" fill="black" fill-rule="nonzero"/><path d="M5.57142857,27.3529412 C10.2857143,30.4411765 18.8571429,30.4411765 23.5714286,27.3529412 L23.5714286,21.1764706 C23.5714286,21.1764706 31.2857143,17.2058824 28.7142857,11.9117647 C25.2857143,6.17647059 17.1428571,8.82352941 15,15.4411765 L15,18.5294118 L15,15.4411765 C12,8.82352941 3.85714286,6.17647059 1.28571429,11.9117647 C-1.28571429,17.2058824 5.57142857,20.7352941 5.57142857,20.7352941 L5.57142857,27.3529412 Z" stroke="black" fill="black" fill-rule="nonzero"/><path d="M12.8571429,1.76470588 L17.1428571,1.76470588" stroke="black"/><path d="M23.1428571,20.7352941 C23.1428571,20.7352941 30.4285714,17.2058824 28.3114286,12.2205882 C24.9857143,7.05882353 17.1428571,10.5882353 15,16.3235294 L15.0085714,18.1764706 L15,16.3235294 C12.8571429,10.5882353 4.20514286,7.05882353 1.71171429,12.2205882 C-0.428571429,17.2058824 5.87142857,20.1617647 5.87142857,20.1617647" stroke="white"/><path d="M5.57142857,21.1764706 C10.2857143,18.5294118 18.8571429,18.5294118 23.5714286,21.1764706 M5.57142857,24.2647059 C10.2857143,21.6176471 18.8571429,21.6176471 23.5714286,24.2647059 M5.57142857,27.3529412 C10.2857143,24.7058824 18.8571429,24.7058824 23.5714286,27.3529412" stroke="white"/></svg>
			<svg xmlns="http://www.w3.org/2000/svg" id="piece-q" --viewBox="-1 -1 +36 +34" viewBox="-3 -3 +40 +38" preserveAspectRatio="xMidYMid" fill="none"  stroke-linecap="round" stroke-linejoin="round"><g fill="black"><ellipse cx="2.61538462" cy="6.22222222" rx="2.3974359" ry="2.44444444"/><ellipse cx="9.58974359" cy="3.55555556" rx="2.3974359" ry="2.44444444"/><ellipse cx="17" cy="2.66666667" rx="2.3974359" ry="2.44444444"/><ellipse cx="24.4102564" cy="3.55555556" rx="2.3974359" ry="2.44444444"/><ellipse cx="31.3846154" cy="6.22222222" rx="2.3974359" ry="2.44444444"/></g><path d="M5.23076923,18.6666667 C12.6410256,17.3333333 23.5384615,17.3333333 28.7692308,18.6666667 L30.9487179,7.55555556 L24.4102564,17.7777778 L24.1487179,5.24444444 L19.6153846,17.3333333 L17,4.44444444 L14.3846154,17.3333333 L9.85128205,5.24444444 L9.58974359,17.7777778 L3.05128205,7.55555556 L5.23076923,18.6666667 Z" stroke="black" stroke-width="1.5" fill="black"/><path d="M5.23076923,18.6666667 C5.23076923,20.4444444 6.53846154,20.4444444 7.41025641,22.2222222 C8.28205128,23.5555556 8.28205128,23.1111111 7.84615385,25.3333333 C6.53846154,26.2222222 6.53846154,27.5555556 6.53846154,27.5555556 C5.23076923,28.8888889 6.97435897,29.7777778 6.97435897,29.7777778 C12.6410256,30.6666667 21.3589744,30.6666667 27.025641,29.7777778 C27.025641,29.7777778 28.3333333,28.8888889 27.025641,27.5555556 C27.025641,27.5555556 27.4615385,26.2222222 26.1538462,25.3333333 C25.7179487,23.1111111 25.7179487,23.5555556 26.5897436,22.2222222 C27.4615385,20.4444444 28.7692308,20.4444444 28.7692308,18.6666667 C21.3589744,17.3333333 12.6410256,17.3333333 5.23076923,18.6666667 Z" stroke="black" stroke-width="1.5" fill="black"/><path d="M6.97435897,29.7777778 C13.4672777,32.080866 20.5327223,32.080866 27.025641,29.7777778" stroke="black" stroke-width="1.5"/><path d="M6.97435897,21.3333333 C13.4672777,19.0302452 20.5327223,19.0302452 27.025641,21.3333333" stroke="white" stroke-width="1.5"/><path d="M8.28205128,23.5555556 L25.7179487,23.5555556" stroke="white" stroke-width="1.5"/><path d="M7.41025641,26.2222222 C13.6372326,28.3241535 20.3627674,28.3241535 26.5897436,26.2222222" stroke="white" stroke-width="1.5"/><path d="M6.53846154,28.8888889 C13.2948481,31.4031829 20.7051519,31.4031829 27.4615385,28.8888889" stroke="white" stroke-width="1.5"/></svg>
			<svg xmlns="http://www.w3.org/2000/svg" id="piece-r" --viewBox="-6 -3 +34 +32" viewBox="-8 -5 +38 +36" preserveAspectRatio="xMidYMid" fill="none"  stroke-linecap="round" stroke-linejoin="round"><polygon stroke="black" stroke-width="1.5" fill="black" points="0 26 22 26 22 23.4 0 23.4"/><polygon stroke="black" stroke-width="1.5" fill="black" points="2.85185185 19.9333333 4.07407407 17.7666667 17.9259259 17.7666667 19.1481481 19.9333333"/><polygon stroke="black" stroke-width="1.5" fill="black" points="2.44444444 23.4 2.44444444 19.9333333 19.5555556 19.9333333 19.5555556 23.4"/><polygon stroke="black" stroke-width="1.5" fill="black" points="4.07407407 17.7666667 4.07407407 6.5 17.9259259 6.5 17.9259259 17.7666667"/><polygon stroke="black" stroke-width="1.5" fill="black" points="4.07407407 6.5 1.62962963 4.33333333 20.3703704 4.33333333 17.9259259 6.5"/><polygon stroke="black" stroke-width="1.5" fill="black" points="1.62962963 4.33333333 1.62962963 0 4.88888889 0 4.88888889 1.73333333 8.96296296 1.73333333 8.96296296 0 13.037037 0 13.037037 1.73333333 17.1111111 1.73333333 17.1111111 0 20.3703704 0 20.3703704 4.33333333"/><polyline stroke="white" points="2.44444444 22.9666667 19.5555556 22.9666667 19.5555556 22.9666667"/><path d="M3.25925926,19.5 L18.7407407,19.5" stroke="white"/><path d="M4.07407407,17.7666667 L17.9259259,17.7666667" stroke="white"/><path d="M4.07407407,6.5 L17.9259259,6.5" stroke="white"/><path d="M1.62962963,4.33333333 L20.3703704,4.33333333" stroke="white"/></svg>
			<svg xmlns="http://www.w3.org/2000/svg" id="piece-b" --viewBox="-3 -1 +34 +34" viewBox="-5 -3 +38 +38" preserveAspectRatio="xMidYMid" fill="none"  stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><g fill="black" fill-rule="nonzero" stroke="black"><path d="M2.54545455,27.3529412 C5.42181818,26.4970588 11.1236364,27.7323529 14,25.5882353 C16.8763636,27.7323529 22.5781818,26.4970588 25.4545455,27.3529412 C25.4545455,27.3529412 26.8545455,27.8294118 28,29.1176471 C27.4230303,29.9735294 26.6,29.9911765 25.4545455,29.5588235 C22.5781818,28.7029412 16.8763636,29.9647059 14,28.6764706 C11.1236364,29.9647059 5.42181818,28.7029412 2.54545455,29.5588235 C1.39660606,29.9911765 0.574424242,29.9735294 0,29.1176471 C1.14884848,27.4058824 2.54545455,27.3529412 2.54545455,27.3529412 Z"/><path d="M7.63636364,23.8235294 C9.75757576,26.0294118 18.2424242,26.0294118 20.3636364,23.8235294 C20.7878788,22.5 20.3636364,22.0588235 20.3636364,22.0588235 C20.3636364,19.8529412 18.2424242,18.5294118 18.2424242,18.5294118 C22.9090909,17.2058824 23.3333333,8.38235294 14,4.85294118 C4.66666667,8.38235294 5.09090909,17.2058824 9.75757576,18.5294118 C9.75757576,18.5294118 7.63636364,19.8529412 7.63636364,22.0588235 C7.63636364,22.0588235 7.21212121,22.5 7.63636364,23.8235294 Z"/><path d="M16.1212121,2.64705882 C16.1212121,3.86533401 15.1715131,4.85294118 14,4.85294118 C12.8284869,4.85294118 11.8787879,3.86533401 11.8787879,2.64705882 C11.8787879,1.42878364 12.8284869,0.441176471 14,0.441176471 C15.1715131,0.441176471 16.1212121,1.42878364 16.1212121,2.64705882 Z"/></g><path d="M9.75757576,18.5294118 L18.2424242,18.5294118 M7.63636364,22.0588235 L20.3636364,22.0588235 M14,9.26470588 L14,13.6764706 M11.8787879,11.4705882 L16.1212121,11.4705882" stroke="white"/></svg>
			<svg xmlns="http://www.w3.org/2000/svg" id="piece-n" --viewBox="-2 -1 +32 +32" viewBox="-4 -3 +36 +36" preserveAspectRatio="xMidYMid" fill="none"  stroke-linecap="round" stroke-linejoin="round" fill-rule="nonzero"><path d="M13.5757576,2.63636364 C22.4848485,3.51515152 27.5757576,9.66666667 27.1515152,28.1212121 L7.63636364,28.1212121 C7.63636364,20.2121212 16.1212121,22.4090909 14.4242424,9.66666667" stroke="black" stroke-width="1.5" fill="black"/><path d="M15.2727273,9.66666667 C15.5951515,12.2239394 10.5636364,16.1433333 8.48484848,17.5757576 C5.93939394,19.3333333 6.09212121,21.389697 4.24242424,21.0909091 C3.35830303,20.2648485 5.43878788,18.4193939 4.24242424,18.4545455 C3.39393939,18.4545455 4.40363636,19.5354545 3.39393939,20.2121212 C2.54545455,20.2121212 -0.00254545455,21.0909091 0,16.6969697 C0,14.9393939 5.09090909,6.15151515 5.09090909,6.15151515 C5.09090909,6.15151515 6.69454545,4.48181818 6.78787879,3.07575758 C6.16848485,2.20224242 6.36363636,1.31818182 6.36363636,0.439393939 C7.21212121,-0.439393939 8.90909091,2.63636364 8.90909091,2.63636364 L10.6060606,2.63636364 C10.6060606,2.63636364 11.2678788,0.885818182 12.7272727,0 C13.5757576,0 13.5757576,2.63636364 13.5757576,2.63636364" stroke="black" stroke-width="1.5" fill="black"/><path d="M2.96969697,16.2575758 C2.96969697,16.5002463 2.77975717,16.6969697 2.54545455,16.6969697 C2.31115192,16.6969697 2.12121212,16.5002463 2.12121212,16.2575758 C2.12121212,16.0149052 2.31115192,15.8181818 2.54545455,15.8181818 C2.77975717,15.8181818 2.96969697,16.0149052 2.96969697,16.2575758 Z" stroke="white" stroke-width="1.5" fill="white"/><path d="M7.6363543,7.46969697 C7.6363543,8.19769267 7.44641868,8.78784979 7.21212121,8.78784979 C6.97782375,8.78784979 6.78788812,8.19769267 6.78788812,7.46969697 C6.78788812,6.74170127 6.97782375,6.15154415 7.21212121,6.15154415 C7.44641868,6.15154415 7.6363543,6.74170127 7.6363543,7.46969697 Z" stroke="white" stroke-width="1.499967" fill="white" transform="translate(7.212121, 7.469697) rotate(30.000728) translate(-7.212121, -7.469697) "/><path d="M15.7393939,2.98787879 L15.3575758,4.26212121 L15.7818182,4.39393939 C18.4545455,5.27272727 20.5757576,6.58212121 22.4848485,10.3257576 C24.3939394,14.0693939 25.2424242,19.3860606 24.8181818,28.1212121 L24.7757576,28.5606061 L26.6848485,28.5606061 L26.7272727,28.1212121 C27.1515152,19.2806061 25.9806061,13.3136364 23.969697,9.36787879 C21.9587879,5.42212121 19.0569697,3.53272727 16.1721212,3.07575758 L15.7393939,2.98787879 Z" fill="white"/></svg>
			<svg xmlns="http://www.w3.org/2000/svg" id="piece-p" --viewBox="-5 -3 +30 +32" viewBox="-7 -5 +34 +36" preserveAspectRatio="xMidYMid" fill="black" stroke-linecap="round" stroke-linejoin="round" stroke="black" stroke-width="1.5" fill-rule="nonzero"><path d="M10,0 C8.15833333,0 6.66666667,1.50129032 6.66666667,3.35483871 C6.66666667,4.10129032 6.90833333,4.78903226 7.31666667,5.35096774 C5.69166667,6.29032258 4.58333333,8.04322581 4.58333333,10.0645161 C4.58333333,11.7670968 5.36666667,13.2851613 6.59166667,14.2832258 C4.09166667,15.1722581 0.416666667,18.9380645 0.416666667,25.5806452 L19.5833333,25.5806452 C19.5833333,18.9380645 15.9083333,15.1722581 13.4083333,14.2832258 C14.6333333,13.2851613 15.4166667,11.7670968 15.4166667,10.0645161 C15.4166667,8.04322581 14.3083333,6.29032258 12.6833333,5.35096774 C13.0916667,4.78903226 13.3333333,4.10129032 13.3333333,3.35483871 C13.3333333,1.50129032 11.8416667,0 10,0 Z"/></svg>
			
			<text data-a="0" id="pos-a-a">a</text>
			<text data-a="1" id="pos-a-b">b</text>
			<text data-a="2" id="pos-a-c">c</text>
			<text data-a="3" id="pos-a-d">d</text>
			<text data-a="4" id="pos-a-e">e</text>
			<text data-a="5" id="pos-a-f">f</text>
			<text data-a="6" id="pos-a-g">g</text>
			<text data-a="7" id="pos-a-h">h</text>
			<text data-n="0" id="pos-n-8">8</text>
			<text data-n="1" id="pos-n-7">7</text>
			<text data-n="2" id="pos-n-6">6</text>
			<text data-n="3" id="pos-n-5">5</text>
			<text data-n="4" id="pos-n-4">4</text>
			<text data-n="5" id="pos-n-3">3</text>
			<text data-n="6" id="pos-n-2">2</text>
			<text data-n="7" id="pos-n-1">1</text>
		</defs>
		<g id="elCheckerboard">
			<use href="#checkerboard">
		</g>
		<g id="elCoordLabels">
			<g class="horz" style="transform: translate(+0px, +8px)">
				<use href="#pos-a-a" data-a="a">a</use>
				<use href="#pos-a-b" data-a="b">b</use>
				<use href="#pos-a-c" data-a="c">c</use>
				<use href="#pos-a-d" data-a="d">d</use>
				<use href="#pos-a-e" data-a="e">e</use>
				<use href="#pos-a-f" data-a="f">f</use>
				<use href="#pos-a-g" data-a="g">g</use>
				<use href="#pos-a-h" data-a="h">h</use>
			</g>
			<g class="vert" style="transform: translate(-1px, +0px)">
				<use href="#pos-n-1" data-n="1">8</use>
				<use href="#pos-n-2" data-n="2">7</use>
				<use href="#pos-n-3" data-n="3">6</use>
				<use href="#pos-n-4" data-n="4">5</use>
				<use href="#pos-n-5" data-n="5">4</use>
				<use href="#pos-n-6" data-n="6">3</use>
				<use href="#pos-n-7" data-n="7">2</use>
				<use href="#pos-n-8" data-n="8">1</use>
			</g>
			<g class="horz" style="transform: translate(+0px, -1px)">
				<use href="#pos-a-a" data-a="a">a</use>
				<use href="#pos-a-b" data-a="b">b</use>
				<use href="#pos-a-c" data-a="c">c</use>
				<use href="#pos-a-d" data-a="d">d</use>
				<use href="#pos-a-e" data-a="e">e</use>
				<use href="#pos-a-f" data-a="f">f</use>
				<use href="#pos-a-g" data-a="g">g</use>
				<use href="#pos-a-h" data-a="h">h</use>
			</g>
			<g class="vert" style="transform: translate(+8px, +0px)">
				<use href="#pos-n-1" data-n="1">8</use>
				<use href="#pos-n-2" data-n="2">7</use>
				<use href="#pos-n-3" data-n="3">6</use>
				<use href="#pos-n-4" data-n="4">5</use>
				<use href="#pos-n-5" data-n="5">4</use>
				<use href="#pos-n-6" data-n="6">3</use>
				<use href="#pos-n-7" data-n="7">2</use>
				<use href="#pos-n-8" data-n="8">1</use>
			</g>
		</g>
		<g id="elCells" class="overlay"></g>
		<g id="elPieces"></g>
		<g id="elArrows" class="overlay swappable"></g>
		<g id="elFrontDots" class="overlay"></g>
	</svg>
`;

function dispatchEvent(element, eventType, detail) {
	element.dispatchEvent(new CustomEvent(eventType, {
		detail: detail,
		bubbles: true,
	}));
}

export default class HTMLChessBoardElement extends HTMLElement {
	static get observedAttributes() {
		return ['arrows', 'dots', 'swap', 'labels', 'state', 'history'];
	}
	
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) {
			return;
		}
		var f = '$$onAttr' + name[0].toUpperCase() + name.slice(1);
		if (typeof this[f] === 'function') {
			this[f](newValue, oldValue);
		}
		else if (this.constructor.observedAttributes.indexOf(name) > -1) {
			this[name] = newValue;
		}
	}
	
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.appendChild(tplBoard.content.cloneNode(true));
		
		// TODO: hardcode ided elements
		var els = this.shadowRoot.querySelectorAll('[id]');
		for (var i = els.length - 1; i >= 0; i--) {
			this['$$' + els[i].id] = els[i];
		}
		
		this.$$elPieces.getPiece = function (coord) {
			coord = Coord.ensure(coord);
			return this.querySelector('[data-a="' + coord.a + '"][data-n="' + coord.n + '"]:not([data-captured])');
		};
		
		this.$$elPieces.getCapturedPiece = function (piece) {
			piece = pieces.Piece.ensure(piece);
			var elPiece = this.querySelectorAll('[href="#piece-' + piece + '"][data-captured]');
			elPiece = elPiece[elPiece.length - 1];
			if (!elPiece) {
				elPiece = document.createElementNS(this.namespaceURI, 'use');
				// elPiece.classList.add('captured');
				elPiece.dataset.captured = this.countCapturedPieces();
				elPiece.classList.toggle('white', piece.isWhite);
				elPiece.classList.toggle('black', !piece.isWhite);
				elPiece.setAttribute('href', '#piece-' + piece);
				elPiece.setAttribute('width', 1);
				elPiece.setAttribute('height', 1);
				this.appendChild(elPiece);
			}
			/*if (piece.coord) {
				elPiece.dataset.a = piece.coord.a;
				elPiece.dataset.n = piece.coord.n;
			}*/
			return elPiece;
		};
		
		this.$$elPieces.countCapturedPieces = function () {
			return this.querySelectorAll('[data-captured]').length;
		};
		
		var a = 'abcdefgh';
		var n = '12345678';
		for (var i = 0; i < a.length; i++) {
			for (var j = 0; j < n.length; j++) {
				var elCell = document.createElementNS(this.$$elCells.namespaceURI, 'rect');
				elCell.dataset.a = a[j];
				elCell.dataset.n = n[i];
				this.$$elCells.appendChild(elCell);
			}
		}
		
		////////////////////
		this.$$onCellsClick = this.$$onCellsClick.bind(this);
	}
	
	connectedCallback() {
		console.time('connectedCallback');
		this.setHistory(this.getAttribute('history'), this.getAttribute('state'));
		this.arrows = this.getAttribute('arrows') || '';
		this.swap = this.swap;
		this.labels = this.labels;
		console.timeEnd('connectedCallback');
		
		this.$$elCells.addEventListener('click', this.$$onCellsClick);
	}
	disconnectedCallback() {
		this.$$elCells.removeEventListener('click', this.$$onCellsClick);
	}
	
	////////////////////
	
	get arrows() {
		return this.getAttribute('arrows');
	}
	set arrows(value) {
		if (value instanceof Array) {
			value = value.join(' ');
		}
		value = (value || '').toString();
		this.setAttribute('arrows', value);
		var arrows = value.trim().split(/\s+/).filter(Boolean);
		while (this.$$elArrows.children.length > arrows.length) {
			this.$$elArrows.removeChild(this.$$elArrows.children[0]);
		}
		while (this.$$elArrows.children.length < arrows.length) {
			this.$$elArrows.appendChild(document.createElementNS(this.$$elArrows.namespaceURI, 'path'));
		}
		for (var i = arrows.length - 1; i >= 0; i--) {
			var value = arrows[i].split('.');
			if (!value[0]) {
				continue;
			}
			var arrow = value[0].split('');
			const coords = [];
			for (var j = 0; j < arrow.length; j += 2) {
				coords.push(Coord.fromTxt(arrow[j] + arrow[j + 1]));
			}
			var elArrow = this.$$elArrows.children[i];
			elArrow.dataset.arrow = arrows[i];
			var d = [];
			for (const coord of coords) {
				d.push(!d.length ? 'M' : 'L', coord.x, 8 - 1 - coord.y);
			}
			elArrow.setAttribute('d', d.join(' '));
			elArrow.className.baseVal = value.slice(1).join(' ')
		}
	}
	
	get dots() {
		return this.getAttribute('dots');
	}
	set dots(value) {
		value = (value || '').toString();
		this.setAttribute('dots', value);
		var dots = value.trim().split(/\s+/).filter(Boolean);
		while (this.$$elFrontDots.children.length > dots.length) {
			this.$$elFrontDots.removeChild(this.$$elFrontDots.children[0]);
		}
		while (this.$$elFrontDots.children.length < dots.length) {
			this.$$elFrontDots.appendChild(document.createElementNS(this.$$elFrontDots.namespaceURI, 'circle'));
		}
		for (var i = dots.length - 1; i >= 0; i--) {
			var value = dots[i].split('.');
			if (!value[0]) {
				continue;
			}
			var coord = Coord.parse(value[0].slice(0, 2));
			var elDot = this.$$elFrontDots.children[i];
			elDot.dataset.a = coord.a;
			elDot.dataset.n = coord.n;
			elDot.className.baseVal = value.slice(1).join(' ');
		}
	}
	
	get swap() {
		return this.hasAttribute('swap');
	}
	set swap(value) {
		value = value === '' || !!value;
		this.toggleAttribute('swap', value);
	}
	
	get labels() {
		return this.getAttribute('labels');
	}
	set labels(value) {
		value = typeof value === 'boolean' ? 'inside' : value;
		if (value !== 'inside' && value !== 'outside') {
			value = '';
		}
		this.$$elRoot.setAttribute('viewBox', value === 'outside' ? '-1 -1 10 10' : '0 0 8 8');
		if (!value || value === 'false') {
			this.removeAttribute('labels');
		}
		else {
			this.setAttribute('labels', value);
		}
	}
	
	get currentState() {
		return this.game.state;
	}
	
	get initialState() {
		return this.getAttribute('state');
	}
	set initialState(value) {
		this.setAttribute('state', value);
	}
	
	get history() {
		return this.getAttribute('history') || '';
	}
	set history(value) {
		this.setAttribute('history', value instanceof Array ? value.join(' ') : value.toString());
	}
	
	get readyState() {
		return this.$$readyState || -1;
	}
	
	////////////////
	
	$$applyMove(move) {
		if (!move) {
			return;
		}
		else if (!(move instanceof Move)) {
			throw new Error("Argument 'move' shoud be an instance of Move");
		}
		var elCap = move.cap && this.$$elPieces.getPiece(move.cap);
		var elPiece = this.$$elPieces.getPiece(move.src);
		var elPiece2 = move.src2 && this.$$elPieces.getPiece(move.src2);
		
		if (elCap) {
			elCap.parentElement.appendChild(elCap);
			elCap.getClientRects && elCap.getClientRects(); // elem.getBoundingClientRect(); // void (document.offsetHeight);
			// elCap.classList.add('captured');
			elCap.dataset.captured = this.$$elPieces.countCapturedPieces();
			// elCap.dataset.n = '';
		}
		
		elPiece.dataset.a = move.dst.a;
		elPiece.dataset.n = move.dst.n;
		if (elPiece2) {
			elPiece2.dataset.a = move.dst2.a;
			elPiece2.dataset.n = move.dst2.n;
		}
		if (move.mut) {
			// elPiece.dataset.piece = move.mut.toString();
			elPiece.setAttribute('href', '#piece-' + move.mut);
		}
		// void (document.offsetHeight);
		
		var arrows = [];
		arrows = this.$$appendLastMoveArrow(arrows);
		arrows = this.$$appendCheckArrows(arrows);
		this.arrows = arrows;
		this.dots = '';
		dispatchEvent(this, 'chessApplyMove', { move: move });
		dispatchEvent(this, 'chessStateChange', { state: this.game.state });
	}
	
	$$undoMove(move) {
		if (!move) {
			return;
		}
		else if (!(move instanceof Move)) {
			throw new Error("Argument 'move' shoud be an instance of Move");
		}
		var elCap = move.cap && this.$$elPieces.getCapturedPiece(move.capPiece);
		var elPiece = this.$$elPieces.getPiece(move.dst);
		var elPiece2 = move.dst2 && this.$$elPieces.getPiece(move.dst2);
		
		if (elCap) {
			// elCap.classList.add('captured');
			// elCap.dataset.captured = '';
			elCap.dataset.a = move.cap.a;
			elCap.dataset.n = move.cap.n;
		}
		
		elPiece.dataset.a = move.src.a;
		elPiece.dataset.n = move.src.n;
		if (elPiece2) {
			elPiece2.dataset.a = move.src2.a;
			elPiece2.dataset.n = move.src2.n;
		}
		if (move.mut) {
			// elPiece.dataset.piece = move.mut.toString();
			elPiece.setAttribute('href', '#piece-' + move.piece);
		}
		
		if (elCap) {
			// elCap.classList.remove('captured');
			delete elCap.dataset.captured;
			elCap.dataset.n = move.cap.n;
		}
		var arrows = [];
		arrows = this.$$appendLastMoveArrow(arrows);
		arrows = this.$$appendCheckArrows(arrows);
		this.arrows = arrows;
		this.dots = '';
		dispatchEvent(this, 'chessUndoMove', { move: move });
		dispatchEvent(this, 'chessStateChange', { state: this.game.state });
	}
	
	$$redrawState() {
		var state = this.game.state;
		this.$$setReadyState(3);
		this.$$elRoot.classList.remove('animated');
		try {
			var len = state.count();
			while (this.$$elPieces.children.length > len) {
				this.$$elPieces.removeChild(this.$$elPieces.children[0]);
			}
			while (this.$$elPieces.children.length < len) {
				this.$$elPieces.appendChild(document.createElementNS(this.$$elPieces.namespaceURI, 'use'));
			}
			let i = -1;
			state.forEach((piece, index) => {
				if (!piece) {
					return;
				}
				i++;
				const coord = Coord.fromIndex(index);
				var elPiece = this.$$elPieces.children[i];
				elPiece.setAttribute('href', '#piece-' + piece);
				// elPiece.setAttribute('x', coord.x);
				// elPiece.setAttribute('y', coord.y);
				elPiece.setAttribute('width', 1);
				elPiece.setAttribute('height', 1);
				// elPiece.classList.remove('captured');
				delete elPiece.dataset.captured;
				elPiece.classList.toggle('white', piece.isWhite);
				elPiece.classList.toggle('black', !piece.isWhite);
				// elPiece.dataset.piece = piece;
				elPiece.dataset.a = coord.a;
				elPiece.dataset.n = coord.n;
			});
			var arrows = [];
			arrows = this.$$appendLastMoveArrow(arrows);
			arrows = this.$$appendCheckArrows(arrows);
			this.arrows = arrows;
			dispatchEvent(this, 'chessStateJump', { state: state });
			dispatchEvent(this, 'chessStateChange', { state: state });
		}
		finally {
			this.$$elRoot.getClientRects && this.$$elRoot.getClientRects(); // elem.getBoundingClientRect(); // void (document.offsetHeight);
			this.$$elRoot.classList.add('animated');
			this.$$setReadyState(4);
		}
	}
	
	$$appendCheckArrows(arrows) {
		arrows = arrows || [];
		const coordK = this.game.state.findKing(this.game.state.activeWhite);
		const attacksK = this.game.state.listAttacks(coordK, !this.game.state.activeWhite);
		for (const src of attacksK) {
			arrows.push(src.txt + coordK.txt + '.attack');
		}
		return arrows;
	}
	
	$$appendLastMoveArrow(arrows) {
		arrows = arrows || [];
		var move = this.game.history[this.game.pos];
		if (move) {
			arrows.push(move.src.txt + move.dst.txt + '.move');
		}
		return arrows;
	}
	
	$$setReadyState(readyState, progress) {
		dispatchEvent(this, 'readyStateChange', {
			readyState: this.$$readyState = readyState,
			progress: progress,
		});
	}
	
	////////////////
	
	$$onCellsClick(event) {
		var coord = new Coord(event.target.dataset.a, event.target.dataset.n);
		return dispatchEvent(this, 'chessClick', { coord: coord });
	}
	
	$$onAttrState(newValue, oldValue) {
		this.setHistoryAsync(this.history, newValue);
	}
	
	$$onAttrHistory(newValue, oldValue) {
		if (!this.game) {
			return null;
		}
		newValue = newValue || '';
		oldValue = oldValue || '';
		console.time('onAttrHistory');
		var d = (
			newValue.indexOf(oldValue) === 0
			? +1
			: (oldValue.indexOf(newValue) === 0 ? -1 : 0)
		);
		if (d) {
			oldValue = !oldValue ? [] : oldValue.split(/\s+/).filter(Boolean);
			newValue = !newValue ? [] : newValue.split(/\s+/).filter(Boolean);
			d = newValue.length - oldValue.length;
		}
		var disableAnimation = !d || Math.abs(d) > 2;
		if (disableAnimation) {
			this.$$elRoot.classList.remove('animated');
		}
		var redraw = !d;
		var finish = () => {
			if (disableAnimation) {
				this.$$elRoot.getClientRects && this.$$elRoot.getClientRects(); // elem.getBoundingClientRect(); // void (document.offsetHeight);
				this.$$elRoot.classList.add('animated');
			}
			console.timeEnd('onAttrHistory');
		};
		// console.warn('redraw', redraw);
		if (redraw) {
			this.setHistoryAsync(newValue)
				.then((res) => {
					finish();
					return res;
				})
				.catch((err) => {
					finish();
					throw err;
				})
			;
		}
		else {
			var seekMoves = () => {
				try {
					if (d < 0) {
						while (d++ < 0) {
							var move = this.game.prev();
							this.$$undoMove(move);
							this.$$setReadyState(2);
						}
						// void (document.offsetHeight);
					}
					else {
						for (var i = oldValue.length; i < newValue.length; i++) {
							var move = this.game.next(newValue[i] == this.game.history[i] ? null : newValue[i]);
							this.$$applyMove(move);
							this.$$setReadyState(2);
						}
						// void (document.offsetHeight);
					}
				}
				finally {
					this.$$setReadyState(4);
					finish();
				}
			};
			if (this.$$readyState === 4) {
				seekMoves();
			}
			else if (this.$$setHistoryAsyncTask) {
				this.$$setHistoryAsyncTask.then(seekMoves);
			}
			else {
				throw new Error("Can't seek: invalid ready state");
			}
		}
	}
	
	setHistory(history, initialState) {
		this.$$setReadyState(1);
		this.game = new Game(history, initialState || this.game && this.game.initialState);
		this.$$redrawState();
		return this.game.history;
	}
	
	async setHistoryAsync(history, initialState) {
		if (this.$$setHistoryAsyncTask) {
			// console.warn("Stop running this.$$setHistoryAsyncTask");
			this.$$setHistoryAsyncTask.stop();
		}
		this.$$setReadyState(1);
		
		var game = new Game([], initialState || this.game && this.game.initialState);
		// console.warn("Start new this.$$setHistoryAsyncTask");
		this.$$setHistoryAsyncTask = game.setHistoryAsync(history, (move, i, history) => {
			// console.warn("Progress this.$$setHistoryAsyncTask", i, history.length);
			this.$$setReadyState(2, (i + 1) / history.length);
		});
		
		return this.$$setHistoryAsyncTask.then((history) => {
			this.$$setHistoryAsyncTask = null;
			// console.warn("Finish this.$$setHistoryAsyncTask", history.length);
			this.game = game;
			this.$$redrawState();
			return history;
		});
	}
	
	setPos(pos) {
		if (this.$$readyState !== 4) {
			throw new Error("Can't set pos: invalid ready state");
		}
		this.game.setPos(pos);
		this.$$redrawState();
		return this.game.pos;
	}
	
	prev() {
		this.setPos(this.game.pos - 1);
	}
	
	move(moveTxt) {
		if (this.$$readyState !== 4) {
			throw new Error("Can't do move: invalid ready state");
		}
		var move = this.game.next(moveTxt);
		this.$$applyMove(move);
		return move;
	}
	
	async whenReady() {
		return Promise.resolve(this.$$setHistoryAsyncTask);
	}
}

window.customElements.define('chess-board', HTMLChessBoardElement);
