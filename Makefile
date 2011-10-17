install.rdf: version
	sed -i -e "s,<em:version>.*</em:version>,<em:version>`cat version`</em:version>," install.rdf
