ifeq ($(PACKAGE_SET),vm)
  # Enable when Thunderbird 68+ will be in Debian
  #DEBIAN_BUILD_DIRS := debian

  # Enable when Thunderbird 68+ will be in CentOS
  ifneq ($(DISTRIBUTION), centos)
  RPM_SPEC_FILES := rpm_spec/thunderbird-qubes.spec
  endif
endif

# vim: filetype=make
