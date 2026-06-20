import { useState, useCallback } from 'react';
import { useApp, MOCK_USERS, MOCK_ROLES, hasPermission, type PermissionAction } from '@/store/AppContext';

export interface SignedInfo {
  signerName: string;
  signerRole: string;
  signerUsername: string;
  timestamp: string;
}

interface MultiRoleSignatureProps {
  label: string;
  roleLabel: string;
  requiredPermission: PermissionAction;
  onSign: (signedInfo: SignedInfo) => void;
  signedInfo?: SignedInfo | null;
  disabled?: boolean;
  disabledReason?: string;
  className?: string;
  otherSignerUsername?: string;
}

export default function MultiRoleSignature({
  label,
  roleLabel,
  requiredPermission,
  onSign,
  signedInfo,
  disabled = false,
  disabledReason = '',
  className = '',
  otherSignerUsername,
}: MultiRoleSignatureProps) {
  const { state, addToast } = useApp();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [inviteStep, setInviteStep] = useState<'select' | 'pin' | 'reason'>('select');
  const [overrideReason, setOverrideReason] = useState('');

  const currentUser = state.currentUserData;
  const currentUsername = currentUser?.username || '';
  const currentRoleId = state.role?.id || '';
  const canSign = hasPermission(currentRoleId, requiredPermission);
  const isQuanDocOrAdmin = currentRoleId === 'quan-doc' || currentRoleId === 'admin';

  const eligibleAccounts = MOCK_USERS.filter((u) => {
    if (u.username === currentUsername) return false;
    if (otherSignerUsername && u.username === otherSignerUsername) return false;
    return hasPermission(u.role, requiredPermission);
  });

  const handleOpenInvite = useCallback(() => {
    if (eligibleAccounts.length === 0) {
      addToast('error', 'Không có tài khoản nào phù hợp để ký vai trò này. Vui lòng liên hệ Admin.');
      return;
    }
    setShowInviteModal(true);
    setInviteStep('select');
    setSelectedAccount('');
    setPinInput('');
    setPinError('');
    setOverrideReason('');
  }, [eligibleAccounts.length, addToast]);

  const handleSelectAccount = useCallback((username: string) => {
    setSelectedAccount(username);
    setPinError('');
    const account = MOCK_USERS.find((u) => u.username === username);
    if (account && isQuanDocOrAdmin && currentRoleId !== account.role) {
      setInviteStep('reason');
    } else {
      setInviteStep('pin');
    }
  }, [isQuanDocOrAdmin, currentRoleId]);

  const handleConfirmPin = useCallback(() => {
    if (!selectedAccount) return;
    const account = MOCK_USERS.find((u) => u.username === selectedAccount);
    if (!account) {
      setPinError('Tài khoản không tồn tại');
      return;
    }
    if (pinInput !== '123456' && pinInput !== '') {
      setPinError('PIN không đúng. PIN mặc định là 123456');
      return;
    }
    if (inviteStep === 'reason' && !overrideReason.trim() && isQuanDocOrAdmin) {
      addToast('warning', 'Quản đốc/Admin ký thay phải nhập lý do');
      return;
    }

    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const role = MOCK_ROLES.find((r) => r.id === account.role);

    const info: SignedInfo = {
      signerName: account.name,
      signerRole: role?.name || account.role,
      signerUsername: account.username,
      timestamp,
    };

    onSign(info);
    setShowInviteModal(false);
    addToast('success', `${account.name} (${role?.name || account.role}) đã ký xác nhận`);
  }, [selectedAccount, pinInput, inviteStep, overrideReason, isQuanDocOrAdmin, onSign, addToast]);

  const handleDirectSign = useCallback(() => {
    if (!currentUser) return;
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    const info: SignedInfo = {
      signerName: currentUser.name,
      signerRole: state.role?.name || '',
      signerUsername: currentUser.username,
      timestamp,
    };

    onSign(info);
  }, [currentUser, state.role?.name, onSign]);

  const getAccountInitial = (name: string) => name.split(' ').pop()?.charAt(0) || '?';

  return (
    <>
      <div className={`bg-ant-card rounded-xl border ${signedInfo ? 'border-ant-sx/40 bg-ant-sx-light/30' : canSign ? 'border-gray-200' : 'border-ant-warning/20 bg-ant-warning/5'} p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${signedInfo ? 'text-ant-sx' : 'text-ant-text-secondary'}`}>
              {label}
            </span>
            {!canSign && !signedInfo && (
              <span className="text-xxs px-1.5 py-0.5 rounded-full bg-ant-warning/10 text-ant-warning font-medium">
                Cần mời ký
              </span>
            )}
          </div>
        </div>

        {signedInfo ? (
          <div className="text-center py-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-ant-sx flex items-center justify-center mb-2">
              <i className="ri-check-line text-2xl text-white" />
            </div>
            <p className="text-xs font-bold text-ant-sx">Đã ký</p>
            <p className="text-xxs text-ant-text-secondary mt-0.5">
              {signedInfo.signerName} · {signedInfo.signerRole}
            </p>
            <p className="text-xxs text-ant-text-secondary/60 mt-0.5 font-mono">
              {signedInfo.timestamp}
            </p>
          </div>
        ) : canSign ? (
          <div>
            <p className="text-xs text-ant-text-secondary mb-3">{roleLabel}</p>
            <button
              onClick={handleDirectSign}
              disabled={disabled}
              className="w-full h-12 rounded-xl bg-ant-sx text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 whitespace-nowrap"
            >
              <i className="ri-pen-nib-line" />
              Ký xác nhận
            </button>
          </div>
        ) : disabled ? (
          <div className="bg-ant-bg rounded-lg p-3 text-center">
            <div className="w-8 h-8 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-1.5">
              <i className="ri-lock-line text-sm text-ant-text-secondary/50" />
            </div>
            <p className="text-xs text-ant-text-secondary/60 font-medium">{disabledReason}</p>
          </div>
        ) : (
          <div>
            <p className="text-xs text-ant-text-secondary mb-1">
              {roleLabel}
            </p>
            <p className="text-xxs text-ant-text-secondary/60 mb-3">
              Vai trò hiện tại không được ký. Mời người có thẩm quyền ký thay.
            </p>
            <button
              onClick={handleOpenInvite}
              className="w-full h-12 rounded-xl border-2 border-dashed border-ant-warning/40 bg-ant-warning/5 text-ant-warning text-sm font-bold flex items-center justify-center gap-2 hover:bg-ant-warning/10 active:scale-[0.98] transition-all whitespace-nowrap"
            >
              <i className="ri-user-add-line" />
              Mời người ký
            </button>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-ant-card rounded-2xl p-5 w-full max-w-sm animate-slide-up max-h-[80vh] overflow-y-auto">
            {inviteStep === 'select' && (
              <>
                <h3 className="text-sm font-bold text-ant-text mb-1">Mời người ký — {label}</h3>
                <p className="text-xs text-ant-text-secondary mb-3">
                  Chọn tài khoản có quyền ký vai trò này
                </p>

                {eligibleAccounts.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-ant-text-secondary">Không có tài khoản phù hợp</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {eligibleAccounts.map((account) => {
                      const role = MOCK_ROLES.find((r) => r.id === account.role);
                      const isSelected = selectedAccount === account.username;
                      return (
                        <button
                          key={account.username}
                          onClick={() => handleSelectAccount(account.username)}
                          className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                            isSelected
                              ? 'border-ant-sx/40 bg-ant-sx-light'
                              : 'border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-lg bg-ant-sx flex items-center justify-center shrink-0">
                            <span className="text-white text-xs font-bold">
                              {getAccountInitial(account.name)}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-ant-text">{account.name}</p>
                            <p className="text-xxs text-ant-text-secondary">
                              {role?.name || account.role} · {account.plant} · {account.department}
                            </p>
                          </div>
                          {isSelected && (
                            <i className="ri-checkbox-circle-fill text-ant-sx text-lg shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary whitespace-nowrap"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => selectedAccount && handleSelectAccount(selectedAccount)}
                    disabled={!selectedAccount}
                    className="flex-1 h-10 rounded-xl bg-ant-sx text-white text-sm font-bold disabled:opacity-50 whitespace-nowrap"
                  >
                    Tiếp tục
                  </button>
                </div>
              </>
            )}

            {inviteStep === 'pin' && (
              <>
                <h3 className="text-sm font-bold text-ant-text mb-1">Xác nhận ký mô phỏng</h3>
                <p className="text-xs text-ant-text-secondary mb-3">
                  Nhập PIN của{' '}
                  <strong>
                    {MOCK_USERS.find((u) => u.username === selectedAccount)?.name || selectedAccount}
                  </strong>
                </p>

                <div className="mb-3">
                  <input
                    type="password"
                    value={pinInput}
                    onChange={(e) => { setPinInput(e.target.value); setPinError(''); }}
                    placeholder="Nhập PIN (mặc định: 123456)"
                    className="w-full h-12 rounded-xl border border-gray-200 px-4 text-sm text-ant-text text-center bg-ant-bg focus:outline-none focus:border-ant-sx"
                    autoFocus
                  />
                  {pinError && (
                    <p className="text-xs text-ant-error mt-1.5 flex items-center gap-1">
                      <i className="ri-error-warning-line text-xs" />
                      {pinError}
                    </p>
                  )}
                </div>

                <p className="text-xxs text-ant-text-secondary/60 mb-3 text-center">
                  PIN mặc định cho tất cả tài khoản mẫu: 123456
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setInviteStep('select')}
                    className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary whitespace-nowrap"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={handleConfirmPin}
                    className="flex-1 h-10 rounded-xl bg-ant-sx text-white text-sm font-bold whitespace-nowrap"
                  >
                    Xác nhận ký
                  </button>
                </div>
              </>
            )}

            {inviteStep === 'reason' && (
              <>
                <h3 className="text-sm font-bold text-ant-text mb-1">Ký thay — Nhập lý do</h3>
                <p className="text-xs text-ant-text-secondary mb-3">
                  Quản đốc/Admin ký thay cho{' '}
                  <strong>
                    {MOCK_USERS.find((u) => u.username === selectedAccount)?.name || selectedAccount}
                  </strong>
                  {' '}— bắt buộc nhập lý do
                </p>

                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Nhập lý do ký thay..."
                  maxLength={500}
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm text-ant-text bg-ant-bg resize-none h-20 focus:outline-none focus:border-ant-sx mb-3"
                  autoFocus
                />
                <p className="text-xxs text-ant-text-secondary text-right -mt-2 mb-3">{overrideReason.length}/500</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setInviteStep('select')}
                    className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-medium text-ant-text-secondary whitespace-nowrap"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={handleConfirmPin}
                    disabled={!overrideReason.trim()}
                    className="flex-1 h-10 rounded-xl bg-ant-sx text-white text-sm font-bold disabled:opacity-50 whitespace-nowrap"
                  >
                    Xác nhận ký thay
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
