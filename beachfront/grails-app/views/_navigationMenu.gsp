<div class = "row">
	<nav class = "navbar navbar-default navbar-static-top" id = "navigationMenu" style = "margin-bottom:0">
		<div class = "container-fluid">
			<div class = "navbar-header">
				<a class = "navbar-brand" href = javascript:void(0) onclick = $("#aboutDialog").modal("show")>Beachfront</a>
			</div>
			<div class = "collapse navbar-collapse">
				<ul class = "nav navbar-nav">
					<g:render template = "menus/mapControls"/>
					<g:render template = "menus/upload"/>
				</ul>
				<ul class="nav navbar-nav navbar-right">
					<li><a href = javascript:void(0) onclick = $("#helpDialog").modal("show")>Help</a></li>
				</ul>
			</div>
		</div>		
	</nav>
</div>