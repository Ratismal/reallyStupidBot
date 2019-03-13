<template>
	<main>
		<section class='container catflex vertical centered'>
			<div class='catflex horizontal around'>
				<img src="/img/littleboi/idle1.gif" height="200px" width="200px"	class='testboi'>
			</div>
			<div class='catflex horizontal around'>
				<pre>{{matrix}}</pre>
			</div>
			<div class='catgrid gap'>
				<div class='col s4'><input type='number' class='full center' v-model="r"></div>
				<div class='col s4'><input type='number' class='full' v-model="g"></div>
				<div class='col s4'><input type='number' class='full' v-model="b"></div>
				<div class='col s4'>{{r/255}}</div>
				<div class='col s4'>{{g/255}}</div>
				<div class='col s4'>{{b/255}}</div>
				<div class='col s4'>{{1 - r/255}}</div>
				<div class='col s4'>{{1 - g/255}}</div>
				<div class='col s4'>{{1 - b/255}}</div>

				<div class='col s2'></div>
				<div class='col s2'>Red</div>
				<div class='col s2'>Green</div>
				<div class='col s2'>Blue</div>
				<div class='col s2'>Alpha</div>
				<div class='col s2'></div>
				<div class='col s2'>Red</div>
				<div class='col s2'><input type='number' class='full matrix' v-model="matrice[0][0]"></div>
				<div class='col s2'><input type='number' class='full matrix' v-model="matrice[0][1]"></div>
				<div class='col s2'><input type='number' class='full matrix' v-model="matrice[0][2]"></div>
				<div class='col s2'><input type='number' class='full matrix' v-model="matrice[0][3]"></div>
				<div class='col s2'><input type='number' class='full matrix' v-model="matrice[0][4]"></div>
				<div class='col s2'>Green</div>
				<div class='col s2'><input type='number' class='full matrix' v-model="matrice[1][0]"></div>
				<div class='col s2'><input type='number' class='full matrix' v-model="matrice[1][1]"></div>
				<div class='col s2'><input type='number' class='full matrix' v-model="matrice[1][2]"></div>
				<div class='col s2'><input type='number' class='full matrix' v-model="matrice[1][3]"></div>
				<div class='col s2'><input type='number' class='full matrix' v-model="matrice[1][4]"></div>
				<div class='col s2'>Blue</div>
				<div class='col s2'><input type='number' class='full matrix' v-model="matrice[2][0]"></div>
				<div class='col s2'><input type='number' class='full matrix' v-model="matrice[2][1]"></div>
				<div class='col s2'><input type='number' class='full matrix' v-model="matrice[2][2]"></div>
				<div class='col s2'><input type='number' class='full matrix' v-model="matrice[2][3]"></div>
				<div class='col s2'><input type='number' class='full matrix' v-model="matrice[2][4]"></div>
				<div class='col s2'>Alpha</div>
				<div class='col s2'><input type='number' class='full matrix' v-model="matrice[3][0]"></div>
				<div class='col s2'><input type='number' class='full matrix' v-model="matrice[3][1]"></div>
				<div class='col s2'><input type='number' class='full matrix' v-model="matrice[3][2]"></div>
				<div class='col s2'><input type='number' class='full matrix' v-model="matrice[3][3]"></div>
				<div class='col s2'><input type='number' class='full matrix' v-model="matrice[3][4]"></div>

			</div>
		</section>
		<svg>
			<filter id="filter">
				<feColorMatrix type="matrix"
					:values="matrix"/>
					<!-- 0.393 0.769 0.189 0 0
							0.349 0.686 0.168 0 0
							0.272 0.534 0.131 0 0
							0   0   0   1 0 -->
			</filter>
		</svg>
	</main>
</template>

<script>
export default {
	data() {
		return {
			r: 0,
			g: 0,
			b: 0,
			matrice: [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 1, 0]],
		};
	},
	computed: {
		matrix() {
			return this.matrice.map(m => (m || 0).join(' ')).join('\n');
		},
	},
};
</script>

<style lang="scss" scoped>
.testboi {
	filter: url(#filter);
}

.matrix {
	max-width: 100px;
}
</style>