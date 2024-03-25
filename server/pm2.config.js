module.exports = {
	apps: [
		{
			name: "API AUPET PROD",
			script: "./dist/index.js",
			watch: true,
			env: {
				"TZ": "America/Sao_Paulo"
			},
			exec_mode: "cluster",
			instances: "2"
		}
	]
};