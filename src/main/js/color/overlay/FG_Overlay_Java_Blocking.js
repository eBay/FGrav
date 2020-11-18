/************************************************************************
 Copyright 2020 eBay Inc.
 Author/Developer: Amir Langer

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 https://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 **************************************************************************/


var blockingPrefixes = [
        "java/lang/Thread.sleep",
        "java/lang/Thread.yield",
        "java/lang/Thread.onSpinWait",
        "java/lang/Object.wait",
        "java/lang/UNIXProcess.forkAndExec",
        "java/lang/ProcessImpl.forkAndExec",
        "java/util/concurrent/locks/LockSupport.park",
        "java/util/concurrent/locks/LockSupport.park",
        "sun/misc/Unsafe.park",
        "jdk/internal/misc/Unsafe.park",
        "java/io/FileInputStream.read",
        "java/io/FileOutputStream.write",
        "java/io/RandomAccessFile.read",
        "java/io/RandomAccessFile.write",
        "java/net/Socket.connect",
        "java/net/DatagramSocket.connect",
        "java/net/PlainDatagramSocketImpl.connect",
        "java/net/PlainDatagramSocketImpl.peekData",
        "java/net/PlainDatagramSocketImpl.send",
        "java/net/PlainSocketImpl.socketAccept",
        "java/net/ServerSocket.implAccept",
        "java/net/SocketInputStream.socketRead0",
        "java/net/Socket$SocketInputStream.read",
        "java/net/SocketOutputStream.socketWrite0",
        "java/net/Socket$SocketOutputStream.write",
    ];

function FG_Overlay_Java_Blocking() {
    FGOverlayMarkByPredicate.call(this,
        function(frame) {
            return function (el) {
                return blockingPrefixes.find(function (prefix) {
                    return frame.name.startsWith(prefix);
                });
            }
        }
    );
}
FG_Overlay_Java_Blocking.prototype = Object.create(FGOverlayMarkByPredicate.prototype);
FG_Overlay_Java_Blocking.prototype.constructor = FG_Overlay_Java_Blocking;


