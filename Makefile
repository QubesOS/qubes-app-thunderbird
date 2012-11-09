clean:
	rm -f install.rdf

install.rdf: install.rdf.template version
	sed -e "s,<em:version>.*</em:version>,<em:version>`cat version`</em:version>," install.rdf.template > install.rdf
