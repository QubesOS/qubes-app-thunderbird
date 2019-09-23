#
# The Qubes OS Project, http://www.qubes-os.org
#
# Copyright (C) 2011  Marek Marczykowski <marmarek@invisiblethingslab.com>
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
#
#

RPMS_DIR=rpm/
VERSION := $(shell cat version)

help:
	@echo "Qubes addons main Makefile:" ;\
	    echo "make rpms                 <--- make all rpms and sign them";\
	    echo; \
	    echo "make clean                <--- clean all the binary files";\
	    echo "make update-repo-current  <-- copy newly generated rpms to qubes yum repo";\
	    echo "make update-repo-current-testing <-- same, but for -current-testing repo";\
	    echo "make update-repo-unstable <-- same, but to -testing repo";\
	    @exit 0;

rpms: rpms-vm

rpms-dom0:

rpms-vm:
	rpmbuild --define "_rpmdir rpm/" -bb rpm_spec/thunderbird-qubes.spec
	rpm --addsign rpm/x86_64/thunderbird-qubes*$(VERSION)*.rpm

clean:
	rm -f manifest.json

update-repo-current:
	for vmrepo in ../yum/current-release/current/vm/* ; do \
		dist=$$(basename $$vmrepo) ;\
		ln -f $(RPMS_DIR)/x86_64/thunderbird-qubes*$(VERSION)*$$dist*.rpm $$vmrepo/rpm/ ;\
	done

update-repo-current-testing:
	for vmrepo in ../yum/current-release/current-testing/vm/* ; do \
		dist=$$(basename $$vmrepo) ;\
		ln -f $(RPMS_DIR)/x86_64/thunderbird-qubes*$(VERSION)*$$dist*.rpm $$vmrepo/rpm/ ;\
	done

update-repo-unstable:
	for vmrepo in ../yum/current-release/unstable/vm/* ; do \
		dist=$$(basename $$vmrepo) ;\
		ln -f $(RPMS_DIR)/x86_64/thunderbird-qubes*$(VERSION)*$$dist*.rpm $$vmrepo/rpm/ ;\
	done

update-repo-template:
	for vmrepo in ../template-builder/yum_repo_qubes/* ; do \
		dist=$$(basename $$vmrepo) ;\
		ln -f $(RPMS_DIR)/x86_64/thunderbird-qubes*$(VERSION)*$$dist*.rpm $$vmrepo/rpm/ ;\
	done

manifest.json: manifest.json.template version
	sed -e "s,@VERSION,`cat version`," manifest.json.template > manifest.json

install-vm:
	install -d $(DESTDIR)/$(EXTDIR)
	install -t $(DESTDIR)/$(EXTDIR) chrome.manifest manifest.json
	install -d $(DESTDIR)/$(EXTDIR)/chrome/locale/en-US
	install -t $(DESTDIR)/$(EXTDIR)/chrome/locale/en-US chrome/locale/en-US/qubesattachment.dtd
	install -d $(DESTDIR)/$(EXTDIR)/chrome/content
	install -t $(DESTDIR)/$(EXTDIR)/chrome/content chrome/content/options.xul chrome/content/qubesattachment.js chrome/content/messenger.xul
	install -d $(DESTDIR)/$(EXTDIR)/chrome/skin
	install -t $(DESTDIR)/$(EXTDIR)/chrome/skin chrome/skin/qubesattachment.css
	install -d $(DESTDIR)/$(EXTDIR)/defaults/preferences
	install -t $(DESTDIR)/$(EXTDIR)/defaults/preferences defaults/preferences/prefs.js
