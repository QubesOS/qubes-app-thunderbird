var qubesattachment = {

    init: function() {
              var CACattachmentView = document.getElementById('attachmentView');
              CACattachmentView.setAttribute("onmousemove", "qubesattachment.doPopup();");
              CACattachmentView.setAttribute("onmousedown", "qubesattachment.doPopup();");
              CACattachmentView.setAttribute("onmouseup", "qubesattachment.doPopup();");
              var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                  .getService(Components.interfaces.nsIPrefService).getBranch("qubesattachment.");
          },

    /* access functions */
    doPopup: function(){
                 //update menu caption appropriately
                 var attachmentList = document.getElementById('attachmentList');
                 // allow only single attachment action
                 document.getElementById('menu_openindvm').setAttribute("disabled", attachmentList.selectedItems.length!=1);
             },

    doOpenAttachment: function(action, currentAttachments){

              var args = [];

              var oProps      = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
              var tempDir     = (oProps.get("TmpD", Components.interfaces.nsIFile)).path;
              var attachmentList = document.getElementById('attachmentList');
              var selectedAttachments = attachmentList.selectedItems;
              var filesLeft = 0;

              var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
              var procPath = Components.classes["@mozilla.org/file/local;1"]
                  .createInstance(Components.interfaces.nsILocalFile);

              procPath.initWithPath(action);
              process.init(procPath);

              var processObserver = {
                    observe: function(subject, topic, data) {
                        for (var i = 0; i < args.length; i++) {
                            var filePath = Components.classes["@mozilla.org/file/local;1"]
                                .createInstance(Components.interfaces.nsILocalFile);
                            filePath.initWithPath(args[i]);
                            filePath.remove(false);
                        }
                    }
              };

              var listener = {
                  OnStartRunningUrl:function (url) {},
                  OnStopRunningUrl:function (url,exitcode) { 
                      filesLeft--;
                      if (filesLeft == 0) {
                          process.runAsync(args, args.length, processObserver);
                      }
                  }
              };

              var processAttachment = function(att, index) {
                      var saveto = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
                      saveto.followLinks = true;
                      saveto.initWithPath(tempDir);
                      saveto.append(att.displayName);
                      saveto.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0600);

                      messenger.saveAttachmentToFile(saveto, att.url, att.uri, att.contentType, listener );
                      args[index] = saveto.path;
              };



              if (selectedAttachments.length==0) {
                  //get all attachments
                  args.length = currentAttachments.length;
                  filesLeft = args.length;
                  for (var i = 0; i < currentAttachments.length; i++) {
                      processAttachment(currentAttachments[i], i);
                  }//for
              } else {
                  //get selected attachments
                  args.length = selectedAttachments.length;
                  filesLeft = args.length;
                  for (var i = 0; i < selectedAttachments.length; i++) {
                      processAttachment(selectedAttachments[i].attachment, i);
                  }//for
              }

          } //doOpenAttachmant

};

if (window.location.href == "chrome://messenger/content/messenger.xul") {
    // Overwrites the original openAttachment function
    var openAttachmentORIG_20111017 = openAttachment;
    var openAttachment = function(aAttachment) {
        var prefs = Components.classes["@mozilla.org/preferences-service;1"]
            .getService(Components.interfaces.nsIPrefService).getBranch("qubesattachment.");
        var dvmDefault = prefs.getBoolPref("dvmdefault");
        if (dvmDefault && aAttachment.contentType != "message/rfc822") {
            var attList = [];
            attList.length = 1;
            attList[0] = aAttachment;
            qubesattachment.doOpenAttachment('/usr/bin/qvm-open-in-dvm', attList);
        } else {
            openAttachmentORIG_20111017(aAttachment);
        }
    };
}

