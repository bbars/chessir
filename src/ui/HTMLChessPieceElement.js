const tplBoard = document.createElement('template');
tplBoard.innerHTML = `
	<style>
	:host {
		all: initial;
		display: contents;
		width: var(--size);
		height: var(--size);
		
		--size: 2em;
		--transition-duration-fast: 0.3s;
		
		--piece-white-light: #fff;
		--piece-white-dark: #421;
		--piece-black-light: #fff;
		--piece-black-dark: #210;
	}
	:host #elRoot {
		display: inline-block;
		width: var(--size);
		height: var(--size);
	}
	
	:host #elRoot > * {
		opacity: 0;
		transition: all var(--transition-duration-fast) ease;
	}
	:host([value="K"]) #elRoot > #piece-K { opacity: 1; }
	:host([value="Q"]) #elRoot > #piece-Q { opacity: 1; }
	:host([value="R"]) #elRoot > #piece-R { opacity: 1; }
	:host([value="B"]) #elRoot > #piece-B { opacity: 1; }
	:host([value="N"]) #elRoot > #piece-N { opacity: 1; }
	:host([value="P"]) #elRoot > #piece-P { opacity: 1; }
	:host([value="k"]) #elRoot > #piece-k { opacity: 1; }
	:host([value="q"]) #elRoot > #piece-q { opacity: 1; }
	:host([value="r"]) #elRoot > #piece-r { opacity: 1; }
	:host([value="b"]) #elRoot > #piece-b { opacity: 1; }
	:host([value="n"]) #elRoot > #piece-n { opacity: 1; }
	:host([value="p"]) #elRoot > #piece-p { opacity: 1; }
	
	</style>
	<svg id="elRoot" class="animated" viewBox="0 0 10 10" preserveAspectRatio="xMidYMid" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink= "http://www.w3.org/1999/xlink">
		<svg xmlns="http://www.w3.org/2000/svg" id="piece-K" --viewbox="-1 -1 +32 +32" viewBox="-3 -3 +36 +36" preserveAspectRatio="xMidYMid" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" style="fill: none; stroke: var(--piece-white-dark);"><path d="M15,4.96764706 L15,0"></path><path d="M12.8571429,1.76470588 L17.1428571,1.76470588"></path><path d="M17.5714286,7.5 C17.5714286,7.5 16.7142857,5.29411765 15,5.29411765 C13.2857143,5.29411765 12.4285714,7.5 12.4285714,7.5 C11.1428571,10.1470588 15,16.7647059 15,16.7647059 C15,16.7647059 18.8571429,10.1470588 17.5714286,7.5 Z" fill-rule="nonzero" style="fill: var(--piece-white-light);"></path><path d="M5.57142857,27.3529412 C10.2857143,30.4411765 18.8571429,30.4411765 23.5714286,27.3529412 L23.5714286,21.1764706 C23.5714286,21.1764706 31.2857143,17.2058824 28.7142857,11.9117647 C25.2857143,6.17647059 17.1428571,8.82352941 15,15.4411765 L15,18.5294118 L15,15.4411765 C12,8.82352941 3.85714286,6.17647059 1.28571429,11.9117647 C-1.28571429,17.2058824 5.57142857,20.7352941 5.57142857,20.7352941 L5.57142857,27.3529412 Z" fill-rule="nonzero" style="fill: var(--piece-white-light);"></path><path d="M5.57142857,21.1764706 C10.2857143,18.5294118 18.8571429,18.5294118 23.5714286,21.1764706"></path><path d="M5.57142857,24.2647059 C10.2857143,21.6176471 18.8571429,21.6176471 23.5714286,24.2647059"></path><path d="M5.57142857,27.3529412 C10.2857143,24.7058824 18.8571429,24.7058824 23.5714286,27.3529412"></path></svg>
		<svg xmlns="http://www.w3.org/2000/svg" id="piece-Q" --viewbox="-1 -1 +36 +34" viewBox="-3 -3 +40 +38" preserveAspectRatio="xMidYMid" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" style="fill: none; stroke: var(--piece-white-dark);"><path d="M3.45945946,6.2 C3.45945946,7.17833299 2.68503308,7.97142857 1.72972973,7.97142857 C0.774426379,7.97142857 0,7.17833299 0,6.2 C0,5.22166701 0.774426379,4.42857143 1.72972973,4.42857143 C2.68503308,4.42857143 3.45945946,5.22166701 3.45945946,6.2 Z" style="fill: var(--piece-white-light);"></path><path d="M17.7297297,2.21428571 C17.7297297,3.1926187 16.9553034,3.98571429 16,3.98571429 C15.0446966,3.98571429 14.2702703,3.1926187 14.2702703,2.21428571 C14.2702703,1.23595273 15.0446966,0.442857143 16,0.442857143 C16.9553034,0.442857143 17.7297297,1.23595273 17.7297297,2.21428571 Z" style="fill: var(--piece-white-light);"></path><path d="M32,6.2 C32,7.17833299 31.2255736,7.97142857 30.2702703,7.97142857 C29.3149669,7.97142857 28.5405405,7.17833299 28.5405405,6.2 C28.5405405,5.22166701 29.3149669,4.42857143 30.2702703,4.42857143 C31.2255736,4.42857143 32,5.22166701 32,6.2 Z" style="fill: var(--piece-white-light);"></path><path d="M10.3783784,3.1 C10.3783784,4.07833299 9.603952,4.87142857 8.64864865,4.87142857 C7.6933453,4.87142857 6.91891892,4.07833299 6.91891892,3.1 C6.91891892,2.12166701 7.6933453,1.32857143 8.64864865,1.32857143 C9.603952,1.32857143 10.3783784,2.12166701 10.3783784,3.1 Z" style="fill: var(--piece-white-light);"></path><path d="M25.0810811,3.54285714 C25.0810811,4.52119013 24.3066547,5.31428571 23.3513514,5.31428571 C22.396048,5.31428571 21.6216216,4.52119013 21.6216216,3.54285714 C21.6216216,2.56452416 22.396048,1.77142857 23.3513514,1.77142857 C24.3066547,1.77142857 25.0810811,2.56452416 25.0810811,3.54285714 Z" style="fill: var(--piece-white-light);"></path><path d="M4.32432432,18.6 C11.6756757,17.2714286 22.4864865,17.2714286 27.6756757,18.6 L29.4054054,7.97142857 L23.3513514,17.7142857 L23.3513514,5.31428571 L18.5945946,17.2714286 L16,3.98571429 L13.4054054,17.2714286 L8.64864865,4.87142857 L8.64864865,17.7142857 L2.59459459,7.97142857 L4.32432432,18.6 Z" style="fill: var(--piece-white-light);"></path><path d="M4.32432432,18.6 C4.32432432,20.3714286 5.62162162,20.3714286 6.48648649,22.1428571 C7.35135135,23.4714286 7.35135135,23.0285714 6.91891892,25.2428571 C5.62162162,26.1285714 5.62162162,27.4571429 5.62162162,27.4571429 C4.32432432,28.7857143 6.05405405,29.6714286 6.05405405,29.6714286 C11.6756757,30.5571429 20.3243243,30.5571429 25.9459459,29.6714286 C25.9459459,29.6714286 27.2432432,28.7857143 25.9459459,27.4571429 C25.9459459,27.4571429 26.3783784,26.1285714 25.0810811,25.2428571 C24.6486486,23.0285714 24.6486486,23.4714286 25.5135135,22.1428571 C26.3783784,20.3714286 27.6756757,20.3714286 27.6756757,18.6 C20.3243243,17.2714286 11.6756757,17.2714286 4.32432432,18.6 Z" style="fill: var(--piece-white-light);"></path><path d="M6.48648649,22.1428571 C9.51351351,21.2571429 22.4864865,21.2571429 25.5135135,22.1428571"></path><path d="M6.91891892,25.2428571 C12.1081081,24.3571429 19.8918919,24.3571429 25.0810811,25.2428571"></path></svg>
		<svg xmlns="http://www.w3.org/2000/svg" id="piece-R" --viewbox="-6 -3 +34 +32" viewBox="-8 -5 +38 +36" preserveAspectRatio="xMidYMid" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" style="fill: none; stroke: var(--piece-white-dark);"><polygon points="0 26 22 26 22 23.4 0 23.4" style="fill: var(--piece-white-light);"></polygon><polygon points="2.44444444 23.4 2.44444444 19.9333333 19.5555556 19.9333333 19.5555556 23.4" style="fill: var(--piece-white-light);"></polygon><polyline points="1.62962963 4.33333333 1.62962963 0 4.88888889 0 4.88888889 1.73333333 8.96296296 1.73333333 8.96296296 0 13.037037 0 13.037037 1.73333333 17.1111111 1.73333333 17.1111111 0 20.3703704 0 20.3703704 4.33333333" style="fill: var(--piece-white-light);"></polyline><polyline points="20.3703704 4.33333333 17.9259259 6.93333333 4.07407407 6.93333333 1.62962963 4.33333333" style="fill: var(--piece-white-light);"></polyline><polyline points="17.9259259 6.93333333 17.9259259 17.7666667 4.07407407 17.7666667 4.07407407 6.93333333" style="fill: var(--piece-white-light);"></polyline><polyline points="17.9259259 17.7666667 19.1481481 19.9333333 2.85185185 19.9333333 4.07407407 17.7666667" style="fill: var(--piece-white-light);"></polyline><path d="M1.62962963,4.33333333 L20.3703704,4.33333333"></path></svg>
		<svg xmlns="http://www.w3.org/2000/svg" id="piece-B" --viewbox="-3 -1 +34 +34" viewBox="-5 -3 +38 +38" preserveAspectRatio="xMidYMid" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" style="fill: none; stroke: var(--piece-white-dark);"><g fill-rule="nonzero" style="fill: var(--piece-white-light);"><path d="M2.54545455,27.3529412 C5.42181818,26.4970588 11.1236364,27.7323529 14,25.5882353 C16.8763636,27.7323529 22.5781818,26.4970588 25.4545455,27.3529412 C25.4545455,27.3529412 26.8545455,27.8294118 28,29.1176471 C27.4230303,29.9735294 26.6,29.9911765 25.4545455,29.5588235 C22.5781818,28.7029412 16.8763636,29.9647059 14,28.6764706 C11.1236364,29.9647059 5.42181818,28.7029412 2.54545455,29.5588235 C1.39660606,29.9911765 0.574424242,29.9735294 0,29.1176471 C1.14884848,27.4058824 2.54545455,27.3529412 2.54545455,27.3529412 Z"></path><path d="M7.63636364,23.8235294 C9.75757576,26.0294118 18.2424242,26.0294118 20.3636364,23.8235294 C20.7878788,22.5 20.3636364,22.0588235 20.3636364,22.0588235 C20.3636364,19.8529412 18.2424242,18.5294118 18.2424242,18.5294118 C22.9090909,17.2058824 23.3333333,8.38235294 14,4.85294118 C4.66666667,8.38235294 5.09090909,17.2058824 9.75757576,18.5294118 C9.75757576,18.5294118 7.63636364,19.8529412 7.63636364,22.0588235 C7.63636364,22.0588235 7.21212121,22.5 7.63636364,23.8235294 Z"></path><path d="M16.1212121,2.64705882 C16.1212121,3.86533401 15.1715131,4.85294118 14,4.85294118 C12.8284869,4.85294118 11.8787879,3.86533401 11.8787879,2.64705882 C11.8787879,1.42878364 12.8284869,0.441176471 14,0.441176471 C15.1715131,0.441176471 16.1212121,1.42878364 16.1212121,2.64705882 Z"></path></g><path d="M9.75757576,18.5294118 L18.2424242,18.5294118 M7.63636364,22.0588235 L20.3636364,22.0588235 M14,9.26470588 L14,13.6764706 M11.8787879,11.4705882 L16.1212121,11.4705882"></path></svg>
		<svg xmlns="http://www.w3.org/2000/svg" id="piece-N" --viewbox="-2 -1 +32 +32" viewBox="-4 -3 +36 +36" preserveAspectRatio="xMidYMid" stroke-linecap="round" stroke-linejoin="round" style="fill: none; stroke: var(--piece-white-dark);"><path d="M13.5757576,2.625 C22.4848485,3.5 27.5757576,9.625 27.1515152,28 L7.63636364,28 C7.63636364,20.125 16.1212121,22.3125 14.4242424,9.625" stroke-width="1.5" style="fill: var(--piece-white-light);"></path><path d="M15.2727273,9.625 C15.5951515,12.17125 10.5636364,16.07375 8.48484848,17.5 C5.93939394,19.25 6.09212121,21.2975 4.24242424,21 C3.35830303,20.1775 5.43878788,18.34 4.24242424,18.375 C3.39393939,18.375 4.40363636,19.45125 3.39393939,20.125 C2.54545455,20.125 -0.00254545455,21 0,16.625 C0,14.875 5.09090909,6.125 5.09090909,6.125 C5.09090909,6.125 6.69454545,4.4625 6.78787879,3.0625 C6.16848485,2.19275 6.36363636,1.3125 6.36363636,0.4375 C7.21212121,-0.4375 8.90909091,2.625 8.90909091,2.625 L10.6060606,2.625 C10.6060606,2.625 11.2678788,0.882 12.7272727,0 C13.5757576,0 13.5757576,2.625 13.5757576,2.625" stroke-width="1.5" style="fill: var(--piece-white-light);"></path><path d="M2.96969697,16.1875 C2.96969697,16.4291246 2.77975717,16.625 2.54545455,16.625 C2.31115192,16.625 2.12121212,16.4291246 2.12121212,16.1875 C2.12121212,15.9458754 2.31115192,15.75 2.54545455,15.75 C2.77975717,15.75 2.96969697,15.9458754 2.96969697,16.1875 Z" stroke-width="1.5" style="fill: var(--piece-white-dark);"></path><path d="M7.6363543,7.4375 C7.6363543,8.16235779 7.44641868,8.74997112 7.21212121,8.74997112 C6.97782375,8.74997112 6.78788812,8.16235779 6.78788812,7.4375 C6.78788812,6.71264221 6.97782375,6.12502888 7.21212121,6.12502888 C7.44641868,6.12502888 7.6363543,6.71264221 7.6363543,7.4375 Z" stroke-width="1.499967" transform="translate(7.212121, 7.437500) rotate(30.000728) translate(-7.212121, -7.437500) " style="fill: var(--piece-white-dark);"></path></svg>
		<svg xmlns="http://www.w3.org/2000/svg" id="piece-P" --viewbox="-5 -3 +30 +32" viewBox="-7 -5 +34 +36" preserveAspectRatio="xMidYMid" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" fill-rule="nonzero" style="fill: var(--piece-white-light); stroke: var(--piece-white-dark);"><path d="M10,0 C8.15833333,0 6.66666667,1.50129032 6.66666667,3.35483871 C6.66666667,4.10129032 6.90833333,4.78903226 7.31666667,5.35096774 C5.69166667,6.29032258 4.58333333,8.04322581 4.58333333,10.0645161 C4.58333333,11.7670968 5.36666667,13.2851613 6.59166667,14.2832258 C4.09166667,15.1722581 0.416666667,18.9380645 0.416666667,25.5806452 L19.5833333,25.5806452 C19.5833333,18.9380645 15.9083333,15.1722581 13.4083333,14.2832258 C14.6333333,13.2851613 15.4166667,11.7670968 15.4166667,10.0645161 C15.4166667,8.04322581 14.3083333,6.29032258 12.6833333,5.35096774 C13.0916667,4.78903226 13.3333333,4.10129032 13.3333333,3.35483871 C13.3333333,1.50129032 11.8416667,0 10,0 Z"></path></svg>
		<svg xmlns="http://www.w3.org/2000/svg" id="piece-k" --viewbox="-1 -1 +32 +32" viewBox="-3 -3 +36 +36" preserveAspectRatio="xMidYMid" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" style="fill: none;"><path d="M15,4.96764706 L15,0" style="stroke: var(--piece-black-dark);"></path><path d="M15,16.7647059 C15,16.7647059 18.8571429,10.1470588 17.5714286,7.5 C17.5714286,7.5 16.7142857,5.29411765 15,5.29411765 C13.2857143,5.29411765 12.4285714,7.5 12.4285714,7.5 C11.1428571,10.1470588 15,16.7647059 15,16.7647059" fill-rule="nonzero" style="fill: var(--piece-black-dark); stroke: var(--piece-black-dark);"></path><path d="M5.57142857,27.3529412 C10.2857143,30.4411765 18.8571429,30.4411765 23.5714286,27.3529412 L23.5714286,21.1764706 C23.5714286,21.1764706 31.2857143,17.2058824 28.7142857,11.9117647 C25.2857143,6.17647059 17.1428571,8.82352941 15,15.4411765 L15,18.5294118 L15,15.4411765 C12,8.82352941 3.85714286,6.17647059 1.28571429,11.9117647 C-1.28571429,17.2058824 5.57142857,20.7352941 5.57142857,20.7352941 L5.57142857,27.3529412 Z" fill-rule="nonzero" style="fill: var(--piece-black-dark); stroke: var(--piece-black-dark);"></path><path d="M12.8571429,1.76470588 L17.1428571,1.76470588" style="stroke: var(--piece-black-dark);"></path><path d="M23.1428571,20.7352941 C23.1428571,20.7352941 30.4285714,17.2058824 28.3114286,12.2205882 C24.9857143,7.05882353 17.1428571,10.5882353 15,16.3235294 L15.0085714,18.1764706 L15,16.3235294 C12.8571429,10.5882353 4.20514286,7.05882353 1.71171429,12.2205882 C-0.428571429,17.2058824 5.87142857,20.1617647 5.87142857,20.1617647" style="stroke: var(--piece-black-light);"></path><path d="M5.57142857,21.1764706 C10.2857143,18.5294118 18.8571429,18.5294118 23.5714286,21.1764706 M5.57142857,24.2647059 C10.2857143,21.6176471 18.8571429,21.6176471 23.5714286,24.2647059 M5.57142857,27.3529412 C10.2857143,24.7058824 18.8571429,24.7058824 23.5714286,27.3529412" style="stroke: var(--piece-black-light);"></path></svg>
		<svg xmlns="http://www.w3.org/2000/svg" id="piece-q" --viewbox="-1 -1 +36 +34" viewBox="-3 -3 +40 +38" preserveAspectRatio="xMidYMid" stroke-linecap="round" stroke-linejoin="round" style="fill: none;"><g style="fill: var(--piece-black-dark);"><ellipse cx="2.61538462" cy="6.22222222" rx="2.3974359" ry="2.44444444"></ellipse><ellipse cx="9.58974359" cy="3.55555556" rx="2.3974359" ry="2.44444444"></ellipse><ellipse cx="17" cy="2.66666667" rx="2.3974359" ry="2.44444444"></ellipse><ellipse cx="24.4102564" cy="3.55555556" rx="2.3974359" ry="2.44444444"></ellipse><ellipse cx="31.3846154" cy="6.22222222" rx="2.3974359" ry="2.44444444"></ellipse></g><path d="M5.23076923,18.6666667 C12.6410256,17.3333333 23.5384615,17.3333333 28.7692308,18.6666667 L30.9487179,7.55555556 L24.4102564,17.7777778 L24.1487179,5.24444444 L19.6153846,17.3333333 L17,4.44444444 L14.3846154,17.3333333 L9.85128205,5.24444444 L9.58974359,17.7777778 L3.05128205,7.55555556 L5.23076923,18.6666667 Z" stroke-width="1.5" style="fill: var(--piece-black-dark); stroke: var(--piece-black-dark);"></path><path d="M5.23076923,18.6666667 C5.23076923,20.4444444 6.53846154,20.4444444 7.41025641,22.2222222 C8.28205128,23.5555556 8.28205128,23.1111111 7.84615385,25.3333333 C6.53846154,26.2222222 6.53846154,27.5555556 6.53846154,27.5555556 C5.23076923,28.8888889 6.97435897,29.7777778 6.97435897,29.7777778 C12.6410256,30.6666667 21.3589744,30.6666667 27.025641,29.7777778 C27.025641,29.7777778 28.3333333,28.8888889 27.025641,27.5555556 C27.025641,27.5555556 27.4615385,26.2222222 26.1538462,25.3333333 C25.7179487,23.1111111 25.7179487,23.5555556 26.5897436,22.2222222 C27.4615385,20.4444444 28.7692308,20.4444444 28.7692308,18.6666667 C21.3589744,17.3333333 12.6410256,17.3333333 5.23076923,18.6666667 Z" stroke-width="1.5" style="fill: var(--piece-black-dark); stroke: var(--piece-black-dark);"></path><path d="M6.97435897,29.7777778 C13.4672777,32.080866 20.5327223,32.080866 27.025641,29.7777778" stroke-width="1.5" style="stroke: var(--piece-black-dark);"></path><path d="M6.97435897,21.3333333 C13.4672777,19.0302452 20.5327223,19.0302452 27.025641,21.3333333" stroke-width="1.5" style="stroke: var(--piece-black-light);"></path><path d="M8.28205128,23.5555556 L25.7179487,23.5555556" stroke-width="1.5" style="stroke: var(--piece-black-light);"></path><path d="M7.41025641,26.2222222 C13.6372326,28.3241535 20.3627674,28.3241535 26.5897436,26.2222222" stroke-width="1.5" style="stroke: var(--piece-black-light);"></path><path d="M6.53846154,28.8888889 C13.2948481,31.4031829 20.7051519,31.4031829 27.4615385,28.8888889" stroke-width="1.5" style="stroke: var(--piece-black-light);"></path></svg>
		<svg xmlns="http://www.w3.org/2000/svg" id="piece-r" --viewbox="-6 -3 +34 +32" viewBox="-8 -5 +38 +36" preserveAspectRatio="xMidYMid" stroke-linecap="round" stroke-linejoin="round" style="fill: none;"><polygon stroke-width="1.5" points="0 26 22 26 22 23.4 0 23.4" style="fill: var(--piece-black-dark); stroke: var(--piece-black-dark);"></polygon><polygon stroke-width="1.5" points="2.85185185 19.9333333 4.07407407 17.7666667 17.9259259 17.7666667 19.1481481 19.9333333" style="fill: var(--piece-black-dark); stroke: var(--piece-black-dark);"></polygon><polygon stroke-width="1.5" points="2.44444444 23.4 2.44444444 19.9333333 19.5555556 19.9333333 19.5555556 23.4" style="fill: var(--piece-black-dark); stroke: var(--piece-black-dark);"></polygon><polygon stroke-width="1.5" points="4.07407407 17.7666667 4.07407407 6.5 17.9259259 6.5 17.9259259 17.7666667" style="fill: var(--piece-black-dark); stroke: var(--piece-black-dark);"></polygon><polygon stroke-width="1.5" points="4.07407407 6.5 1.62962963 4.33333333 20.3703704 4.33333333 17.9259259 6.5" style="fill: var(--piece-black-dark); stroke: var(--piece-black-dark);"></polygon><polygon stroke-width="1.5" points="1.62962963 4.33333333 1.62962963 0 4.88888889 0 4.88888889 1.73333333 8.96296296 1.73333333 8.96296296 0 13.037037 0 13.037037 1.73333333 17.1111111 1.73333333 17.1111111 0 20.3703704 0 20.3703704 4.33333333" style="fill: var(--piece-black-dark); stroke: var(--piece-black-dark);"></polygon><polyline points="2.44444444 22.9666667 19.5555556 22.9666667 19.5555556 22.9666667" style="stroke: var(--piece-black-light);"></polyline><path d="M3.25925926,19.5 L18.7407407,19.5" style="stroke: var(--piece-black-light);"></path><path d="M4.07407407,17.7666667 L17.9259259,17.7666667" style="stroke: var(--piece-black-light);"></path><path d="M4.07407407,6.5 L17.9259259,6.5" style="stroke: var(--piece-black-light);"></path><path d="M1.62962963,4.33333333 L20.3703704,4.33333333" style="stroke: var(--piece-black-light);"></path></svg>
		<svg xmlns="http://www.w3.org/2000/svg" id="piece-b" --viewbox="-3 -1 +34 +34" viewBox="-5 -3 +38 +38" preserveAspectRatio="xMidYMid" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" style="fill: none;"><g fill-rule="nonzero" style="fill: var(--piece-black-dark); stroke: var(--piece-black-dark);"><path d="M2.54545455,27.3529412 C5.42181818,26.4970588 11.1236364,27.7323529 14,25.5882353 C16.8763636,27.7323529 22.5781818,26.4970588 25.4545455,27.3529412 C25.4545455,27.3529412 26.8545455,27.8294118 28,29.1176471 C27.4230303,29.9735294 26.6,29.9911765 25.4545455,29.5588235 C22.5781818,28.7029412 16.8763636,29.9647059 14,28.6764706 C11.1236364,29.9647059 5.42181818,28.7029412 2.54545455,29.5588235 C1.39660606,29.9911765 0.574424242,29.9735294 0,29.1176471 C1.14884848,27.4058824 2.54545455,27.3529412 2.54545455,27.3529412 Z"></path><path d="M7.63636364,23.8235294 C9.75757576,26.0294118 18.2424242,26.0294118 20.3636364,23.8235294 C20.7878788,22.5 20.3636364,22.0588235 20.3636364,22.0588235 C20.3636364,19.8529412 18.2424242,18.5294118 18.2424242,18.5294118 C22.9090909,17.2058824 23.3333333,8.38235294 14,4.85294118 C4.66666667,8.38235294 5.09090909,17.2058824 9.75757576,18.5294118 C9.75757576,18.5294118 7.63636364,19.8529412 7.63636364,22.0588235 C7.63636364,22.0588235 7.21212121,22.5 7.63636364,23.8235294 Z"></path><path d="M16.1212121,2.64705882 C16.1212121,3.86533401 15.1715131,4.85294118 14,4.85294118 C12.8284869,4.85294118 11.8787879,3.86533401 11.8787879,2.64705882 C11.8787879,1.42878364 12.8284869,0.441176471 14,0.441176471 C15.1715131,0.441176471 16.1212121,1.42878364 16.1212121,2.64705882 Z"></path></g><path d="M9.75757576,18.5294118 L18.2424242,18.5294118 M7.63636364,22.0588235 L20.3636364,22.0588235 M14,9.26470588 L14,13.6764706 M11.8787879,11.4705882 L16.1212121,11.4705882" style="stroke: var(--piece-black-light);"></path></svg>
		<svg xmlns="http://www.w3.org/2000/svg" id="piece-n" --viewbox="-2 -1 +32 +32" viewBox="-4 -3 +36 +36" preserveAspectRatio="xMidYMid" stroke-linecap="round" stroke-linejoin="round" fill-rule="nonzero" style="fill: none;"><path d="M13.5757576,2.63636364 C22.4848485,3.51515152 27.5757576,9.66666667 27.1515152,28.1212121 L7.63636364,28.1212121 C7.63636364,20.2121212 16.1212121,22.4090909 14.4242424,9.66666667" stroke-width="1.5" style="fill: var(--piece-black-dark); stroke: var(--piece-black-dark);"></path><path d="M15.2727273,9.66666667 C15.5951515,12.2239394 10.5636364,16.1433333 8.48484848,17.5757576 C5.93939394,19.3333333 6.09212121,21.389697 4.24242424,21.0909091 C3.35830303,20.2648485 5.43878788,18.4193939 4.24242424,18.4545455 C3.39393939,18.4545455 4.40363636,19.5354545 3.39393939,20.2121212 C2.54545455,20.2121212 -0.00254545455,21.0909091 0,16.6969697 C0,14.9393939 5.09090909,6.15151515 5.09090909,6.15151515 C5.09090909,6.15151515 6.69454545,4.48181818 6.78787879,3.07575758 C6.16848485,2.20224242 6.36363636,1.31818182 6.36363636,0.439393939 C7.21212121,-0.439393939 8.90909091,2.63636364 8.90909091,2.63636364 L10.6060606,2.63636364 C10.6060606,2.63636364 11.2678788,0.885818182 12.7272727,0 C13.5757576,0 13.5757576,2.63636364 13.5757576,2.63636364" stroke-width="1.5" style="fill: var(--piece-black-dark); stroke: var(--piece-black-dark);"></path><path d="M2.96969697,16.2575758 C2.96969697,16.5002463 2.77975717,16.6969697 2.54545455,16.6969697 C2.31115192,16.6969697 2.12121212,16.5002463 2.12121212,16.2575758 C2.12121212,16.0149052 2.31115192,15.8181818 2.54545455,15.8181818 C2.77975717,15.8181818 2.96969697,16.0149052 2.96969697,16.2575758 Z" stroke-width="1.5" style="fill: var(--piece-black-light); stroke: var(--piece-black-light);"></path><path d="M7.6363543,7.46969697 C7.6363543,8.19769267 7.44641868,8.78784979 7.21212121,8.78784979 C6.97782375,8.78784979 6.78788812,8.19769267 6.78788812,7.46969697 C6.78788812,6.74170127 6.97782375,6.15154415 7.21212121,6.15154415 C7.44641868,6.15154415 7.6363543,6.74170127 7.6363543,7.46969697 Z" stroke-width="1.499967" transform="translate(7.212121, 7.469697) rotate(30.000728) translate(-7.212121, -7.469697) " style="fill: var(--piece-black-light); stroke: var(--piece-black-light);"></path><path d="M15.7393939,2.98787879 L15.3575758,4.26212121 L15.7818182,4.39393939 C18.4545455,5.27272727 20.5757576,6.58212121 22.4848485,10.3257576 C24.3939394,14.0693939 25.2424242,19.3860606 24.8181818,28.1212121 L24.7757576,28.5606061 L26.6848485,28.5606061 L26.7272727,28.1212121 C27.1515152,19.2806061 25.9806061,13.3136364 23.969697,9.36787879 C21.9587879,5.42212121 19.0569697,3.53272727 16.1721212,3.07575758 L15.7393939,2.98787879 Z" style="fill: var(--piece-black-light);"></path></svg>
		<svg xmlns="http://www.w3.org/2000/svg" id="piece-p" --viewbox="-5 -3 +30 +32" viewBox="-7 -5 +34 +36" preserveAspectRatio="xMidYMid" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" fill-rule="nonzero" style="fill: var(--piece-black-dark); stroke: var(--piece-black-dark);"><path d="M10,0 C8.15833333,0 6.66666667,1.50129032 6.66666667,3.35483871 C6.66666667,4.10129032 6.90833333,4.78903226 7.31666667,5.35096774 C5.69166667,6.29032258 4.58333333,8.04322581 4.58333333,10.0645161 C4.58333333,11.7670968 5.36666667,13.2851613 6.59166667,14.2832258 C4.09166667,15.1722581 0.416666667,18.9380645 0.416666667,25.5806452 L19.5833333,25.5806452 C19.5833333,18.9380645 15.9083333,15.1722581 13.4083333,14.2832258 C14.6333333,13.2851613 15.4166667,11.7670968 15.4166667,10.0645161 C15.4166667,8.04322581 14.3083333,6.29032258 12.6833333,5.35096774 C13.0916667,4.78903226 13.3333333,4.10129032 13.3333333,3.35483871 C13.3333333,1.50129032 11.8416667,0 10,0 Z"></path></svg>
	</svg>
`;

export default class HTMLChessPieceElement extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.appendChild(tplBoard.content.cloneNode(true));
	}
	
	get value() {
		return this.getAttribute('value');
	}
	set value(value) {
		if (value === null) {
			this.removeAttribute('value');
		}
		else {
			this.setAttribute('value', value);
		}
	}
}

window.customElements.define('chess-piece', HTMLChessPieceElement);