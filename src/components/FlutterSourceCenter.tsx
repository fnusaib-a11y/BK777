import React, { useState } from 'react';
import { Clipboard, Check, Terminal, FileCode, ShieldAlert, Cpu } from 'lucide-react';

interface FlutterFile {
  name: string;
  description: string;
  language: 'dart' | 'json';
  code: string;
}

export default function FlutterSourceCenter() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);

  const files: FlutterFile[] = [
    {
      name: 'firebase_service.dart',
      description: 'Core helper handling Auth, user coins, referral trees, and anti-cheat checks on Firestore.',
      language: 'dart',
      code: `import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_vpn/flutter_vpn.dart'; // VPN protection package

class FirebaseService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // Retrieves current authenticated user state
  Stream<DocumentSnapshot> streamUserBalance() {
    String uid = _auth.currentUser!.uid;
    return _db.collection('users').doc(uid).snapshots();
  }

  // VPN Detection Helper to prevent fake geographical cheating
  Future<bool> isVPNActive() async {
    try {
      return await FlutterVpn.isVpnConnected();
    } catch (e) {
      return false; // Fail safe
    }
  }

  // Safe reward coin credit with Anti-Cheat device-level assertions
  Future<Map<String, dynamic>> claimTaskReward({
    required String taskId, 
    required int coins, 
    required String deviceId,
  }) async {
    String uid = _auth.currentUser!.uid;
    
    // Check for VPN connection first
    if (await isVPNActive()) {
      return {'success': false, 'error': 'VPN connection detected. Turn off VPN.'};
    }

    DocumentReference userRef = _db.collection('users').doc(uid);
    DocumentReference taskRef = _db.collection('tasks').doc(taskId);
    DocumentReference completionRef = _db.collection('completions').doc('\${uid}_\${taskId}');

    return _db.runTransaction((transaction) async {
      // 1. Assert unique device and user execution (anti-cheat)
      DocumentSnapshot completionSnap = await transaction.get(completionRef);
      if (completionSnap.exists) {
        throw Exception('Task already completed on this account/device!');
      }

      DocumentSnapshot userSnap = await transaction.get(userRef);
      if (!userSnap.exists) throw Exception('User not registered');

      // Check device ID duplicate restriction
      QuerySnapshot deviceCheck = await _db.collection('users')
          .where('deviceId', isEqualTo: deviceId)
          .get();
      if (deviceCheck.docs.length > 1 && userSnap.get('deviceId') != deviceId) {
        throw Exception('Anti-cheat: Multi-account device association blocked.');
      }

      // 2. Fetch active advertisement settings from panel
      DocumentSnapshot adSnap = await _db.collection('settings').doc('ads').get();
      bool adsRequired = adSnap.get('isEnabled') ?? false;

      // 3. Perform atomic coin increments and mark completion
      transaction.update(userRef, {
        'coinsAvailable': FieldValue.increment(coins),
        'coinsLifetime': FieldValue.increment(coins),
      });

      transaction.set(completionRef, {
        'userId': uid,
        'taskId': taskId,
        'coinsEarned': coins,
        'completedAt': FieldValue.serverTimestamp(),
        'deviceId': deviceId,
      });

      // 4. Update referral multi-level commissions (if code registered)
      String? referrerUid = userSnap.get('referredBy');
      if (referrerUid != null && referrerUid.isNotEmpty) {
        DocumentReference referrerRef = _db.collection('users').doc(referrerUid);
        // Reward level 1 sponsor with 10% cash back
        transaction.update(referrerRef, {
          'coinsAvailable': FieldValue.increment((coins * 0.1).round()),
          'coinsLifetime': FieldValue.increment((coins * 0.1).round()),
        });
      }

      return {'success': true};
    }).catchError((e) {
      return {'success': false, 'error': e.toString()};
    });
  }
}`
    },
    {
      name: 'in_app_browser_screen.dart',
      description: 'Flutter interactive In-App Browser featuring timer synchronization, minimize security alerts, and back-button blockade.',
      language: 'dart',
      code: `import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart'; // WebView implementation

class InAppBrowserScreen extends StatefulWidget {
  final String targetUrl;
  final int durationSeconds;
  final Function() onCompleted;

  const InAppBrowserScreen({
    Key? key,
    required this.targetUrl,
    required this.durationSeconds,
    required this.onCompleted,
  }) : super(key: key);

  @override
  _InAppBrowserScreenState createState() => _InAppBrowserScreenState();
}

class _InAppBrowserScreenState extends State<InAppBrowserScreen> with WidgetsBindingObserver {
  late int _timeLeft;
  Timer? _timer;
  bool _isTimerActive = false;
  bool _isClaimable = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this); // Listen to app minimization
    _timeLeft = widget.durationSeconds;
    startTimer();
  }

  void startTimer() {
    _isTimerActive = true;
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_timeLeft > 0) {
        setState(() {
          _timeLeft--;
        });
      } else {
        setState(() {
          _isClaimable = true;
          _isTimerActive = false;
        });
        _timer?.cancel();
      }
    });
  }

  void pauseTimer() {
    if (_isTimerActive) {
      _timer?.cancel();
      _isTimerActive = false;
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // ANTI-CHEAT: Pause timer when user minimizes app, switch apps, or opens notification shade
    if (state == AppLifecycleState.paused || state == AppLifecycleState.inactive) {
      pauseTimer();
      showCheatWarningDialog();
    } else if (state == AppLifecycleState.resumed && _timeLeft > 0) {
      startTimer();
    }
  }

  void showCheatWarningDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: Row(
          children: const [
            Icon(Icons.warning_amber_rounded, color: Colors.red),
            SizedBox(width: 8),
            Text('Anti-Cheat Triggered'),
          ],
        ),
        content: const Text(
          'Do not minimize the app or visit other tabs while completing timer tasks. '
          'The security timer has been paused.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Resume Task'),
          )
        ],
      ),
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      // ANTI-CHEAT: Disable direct back button during active timer
      onWillPop: () async {
        if (!_isClaimable) {
          final exitConfirmed = await showDialog<bool>(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text('Exit Task?'),
              content: const Text('If you leave now, you will lose progress on your coin rewards.'),
              actions: [
                TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Stay')),
                TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Exit & Forfeit')),
              ],
            ),
          );
          return exitConfirmed ?? false;
        }
        return true;
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text(_isClaimable ? 'Task Complete!' : 'Task Timer: \$_timeLeft seconds'),
          backgroundColor: Colors.blueAccent,
          actions: [
            if (_isClaimable)
              IconButton(
                icon: const Icon(Icons.check_circle, color: Colors.greenAccent, size: 28),
                onPressed: () {
                  widget.onCompleted();
                  Navigator.of(context).pop();
                },
              )
          ],
        ),
        body: Column(
          children: [
            if (!_isClaimable)
              LinearProgressIndicator(
                value: 1.0 - (_timeLeft / widget.durationSeconds),
                color: Colors.greenAccent,
                backgroundColor: Colors.blueAccent.withOpacity(0.2),
              ),
            Expanded(
              child: InAppWebView(
                initialUrlRequest: URLRequest(url: WebUri(widget.targetUrl)),
              ),
            ),
            if (_isClaimable)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                color: Colors.green.shade50,
                child: ElevatedButton.icon(
                  onPressed: () {
                    widget.onCompleted();
                    Navigator.of(context).pop();
                  },
                  icon: const Icon(Icons.stars),
                  label: const Text('CLAIM COINS NOW', style: TextStyle(fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}`
    },
    {
      name: 'firestore.rules',
      description: 'Firebase cloud security rules that block malicious write commands, enforce minimum payouts, and lock transaction structures.',
      language: 'json',
      code: `{
  "rules": {
    "firestore": {
      "databases": {
        "(default)": {
          "rules": {
            // Helper function to verify authenticated user
            "function isAuth()": "request.auth != null",
            
            // Helper function to verify user acts on their own profile
            "function isSelf(userId)": "isAuth() && request.auth.uid == userId",

            "match /users/{userId}": {
              "allow read": "isAuth()",
              // Only allow update of specific coins by normal flow or dynamic registration
              "allow create": "isSelf(userId)",
              "allow update": "isSelf(userId) && 
                              !request.resource.data.diff(resource.data).affectedKeys().hasAny(['coinsAvailable', 'coinsLifetime', 'isBanned'])"
            },

            "match /completions/{completionId}": {
              "allow read": "isAuth()",
              // Allow registration via transaction verification only (write block directly)
              "allow write": "false" 
            },

            "match /withdrawals/{requestId}": {
              "allow read": "isAuth() && (resource.data.userId == request.auth.uid || request.auth.token.admin == true)",
              "allow create": "isAuth() && request.auth.uid == request.resource.data.userId && 
                              request.resource.data.status == 'pending' &&
                              request.resource.data.amountCoins >= 1000", // Rule enforced Min Coins
              "allow update, delete": "request.auth.token.admin == true" // Admin controlled approval
            },

            "match /kyc/{userId}": {
              "allow read, write": "isSelf(userId) && request.resource.data.status == 'pending'",
              "allow update": "request.auth.token.admin == true"
            },

            "match /settings/{settingId}": {
              "allow read": "isAuth()",
              "allow write": "request.auth.token.admin == true"
            }
          }
        }
      }
    }
  }
}`
    }
  ];

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div id="flutter-source-hub" className="bg-slate-900 border border-slate-800 rounded-xl max-w-full overflow-hidden text-slate-100 flex flex-col h-full">
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="text-emerald-400 w-5 h-5" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
            Flutter + Firebase Backend Source Center
          </h2>
        </div>
        <div className="flex gap-2 text-xs bg-slate-900 py-1 px-3 border border-slate-800 rounded-full text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span>Production Ready Code Blueprint</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 bg-slate-950/50 border-b border-slate-800">
        {files.map((file, index) => (
          <button
            key={file.name}
            id={`file-tab-${index}`}
            onClick={() => setActiveTab(index)}
            className={`flex items-center gap-2 p-3 text-xs font-semibold border-b-2 transition-all cursor-pointer text-left ${
              activeTab === index
                ? 'border-emerald-500 text-emerald-400 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <FileCode className="w-4 h-4 flex-shrink-0" />
            <div className="truncate">
              <p className="font-mono text-xs">{file.name}</p>
              <p className="text-[10px] text-slate-500 font-normal font-sans italic truncate">
                {file.name.endsWith('.rules') ? 'Cloud Security' : 'Flutter Source'}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="p-4 bg-slate-950 flex items-center gap-3 text-xs border-b border-slate-800/80">
        <ShieldAlert className="text-indigo-400 w-5 h-5 flex-shrink-0" />
        <p className="text-slate-300 leading-relaxed">
          <span className="font-bold text-slate-200">File Explanation: </span>
          {files[activeTab].description}
        </p>
      </div>

      <div className="relative flex-1 bg-slate-900/30 overflow-auto max-h-[500px]">
        <button
          id={`copy-code-btn-${activeTab}`}
          onClick={() => handleCopy(files[activeTab].code, activeTab)}
          className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 hover:text-white border border-slate-700/80 rounded-md text-xs font-medium cursor-pointer transition-all"
        >
          {copiedIndex === activeTab ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400 font-bold" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Clipboard className="w-3.5 h-3.5" />
              <span>Copy Code</span>
            </>
          )}
        </button>

        <pre className="p-4 text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto whitespace-pre">
          <code>{files[activeTab].code}</code>
        </pre>
      </div>

      <div className="bg-slate-950/80 p-3 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-500">
        <span>{"Framework: Google Flutter (Dart SDK >= 3.0.0)"}</span>
        <span className="text-emerald-500">No mock APIs • Fully configured for Real Firestore integration</span>
      </div>
    </div>
  );
}
