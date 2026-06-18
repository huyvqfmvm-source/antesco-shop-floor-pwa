import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useApp, MOCK_ROLES, MOCK_PLANTS } from '@/store/AppContext';
import type { MockUser } from '@/mocks/data';

const DEPARTMENTS = [
  { id: 'Sản xuất', name: 'Sản xuất' },
  { id: 'Kho', name: 'Kho' },
  { id: 'QM/KCS', name: 'QM/KCS' },
  { id: 'Kỹ thuật', name: 'Kỹ thuật' },
  { id: 'Kế toán kho', name: 'Kế toán kho' },
];

export default function RegisterPage() {
  const { state, register, addToast } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    employeeCode: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'cong-nhan-san-xuat',
    plant: 'MA',
    department: 'Sản xuất',
  });
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (state.isLoggedIn) {
    return <Navigate to="/home" replace />;
  }

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.fullName.trim()) { setError('Vui lòng nhập họ và tên.'); return; }
    if (!form.employeeCode.trim()) { setError('Vui lòng nhập mã nhân viên.'); return; }
    if (!form.phone.trim()) { setError('Vui lòng nhập số điện thoại.'); return; }
    if (!form.username.trim()) { setError('Vui lòng nhập tên đăng nhập.'); return; }
    if (form.username.trim().length < 3) { setError('Tên đăng nhập phải có ít nhất 3 ký tự.'); return; }
    if (!form.password) { setError('Vui lòng nhập mật khẩu.'); return; }
    if (form.password.length < 4) { setError('Mật khẩu phải có ít nhất 4 ký tự.'); return; }
    if (form.password !== form.confirmPassword) { setError('Mật khẩu nhập lại không khớp.'); return; }
    if (!agreed) { setError('Vui lòng xác nhận đây là tài khoản môi trường mô phỏng.'); return; }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const newUser: MockUser = {
      name: form.fullName.trim(),
      username: form.username.trim().toLowerCase(),
      password: form.password,
      role: form.role,
      plant: form.plant,
      department: form.department,
      employeeCode: form.employeeCode.trim(),
      phone: form.phone.trim(),
    };

    const result = register(newUser);

    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'Đăng ký thất bại. Vui lòng thử lại.');
      return;
    }

    addToast('success', 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
    navigate('/login?registered=1', { replace: true });
  };

  const roleOptions = MOCK_ROLES.filter((r) => r.id !== 'admin');
  const plantOptions = MOCK_PLANTS;

  return (
    <div className="flex justify-center min-h-screen bg-ant-bg">
      <div className="w-full max-w-mobile flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-ant-card border-b border-gray-100 px-4 h-14 flex items-center gap-3 shrink-0">
          <Link
            to="/login"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <i className="ri-arrow-left-line text-lg text-ant-text" />
          </Link>
          <div>
            <p className="text-sm font-bold text-ant-text">Đăng ký tài khoản</p>
            <p className="text-xxs text-ant-text-secondary">Tạo tài khoản mô phỏng mới</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Personal Info Section */}
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-3">Thông tin cá nhân</h3>
              
              <div className="space-y-3">
                <FieldWrapper label="Họ và tên" required>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    placeholder="VD: Nguyễn Văn A"
                    className="input-field"
                  />
                </FieldWrapper>

                <div className="grid grid-cols-2 gap-3">
                  <FieldWrapper label="Mã nhân viên" required>
                    <input
                      type="text"
                      value={form.employeeCode}
                      onChange={(e) => updateField('employeeCode', e.target.value)}
                      placeholder="VD: NV-007"
                      className="input-field"
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Số điện thoại" required>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="VD: 0912..."
                      className="input-field"
                    />
                  </FieldWrapper>
                </div>
              </div>
            </div>

            {/* Account Info Section */}
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-3">Thông tin tài khoản</h3>
              
              <div className="space-y-3">
                <FieldWrapper label="Tên đăng nhập" required>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => updateField('username', e.target.value)}
                    placeholder="VD: a.nguyen"
                    autoComplete="off"
                    className="input-field"
                  />
                </FieldWrapper>

                <FieldWrapper label="Mật khẩu" required>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      placeholder="Tối thiểu 4 ký tự"
                      autoComplete="new-password"
                      className="input-field pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    >
                      <i className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-ant-text-secondary text-base`} />
                    </button>
                  </div>
                </FieldWrapper>

                <FieldWrapper label="Nhập lại mật khẩu" required>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={(e) => updateField('confirmPassword', e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      autoComplete="new-password"
                      className={`input-field pr-10 ${form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    >
                      <i className={`${showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-ant-text-secondary text-base`} />
                    </button>
                  </div>
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p className="text-xxs text-ant-error mt-1">Mật khẩu không khớp</p>
                  )}
                </FieldWrapper>
              </div>
            </div>

            {/* Role & Plant Section */}
            <div className="bg-ant-card rounded-xl border border-gray-100 p-4">
              <h3 className="text-xs font-bold text-ant-text-secondary uppercase tracking-wider mb-3">Vai trò &amp; Nhà máy</h3>
              
              <div className="space-y-3">
                <fieldset>
                  <legend className="text-sm font-semibold text-ant-text mb-2">Chọn vai trò <span className="text-ant-error">*</span></legend>
                  <div className="grid grid-cols-2 gap-2">
                    {roleOptions.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => updateField('role', role.id)}
                        className={`px-3 py-2.5 rounded-lg text-left text-xs font-medium border transition-all ${
                          form.role === role.id
                            ? 'border-ant-sx bg-ant-sx-light text-ant-sx-dark'
                            : 'border-gray-200 bg-ant-bg text-ant-text-secondary hover:border-gray-300'
                        }`}
                      >
                        {role.name}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="text-sm font-semibold text-ant-text mb-2">Chọn nhà máy <span className="text-ant-error">*</span></legend>
                  <div className="grid grid-cols-2 gap-2">
                    {plantOptions.map((plant) => (
                      <button
                        key={plant.id}
                        type="button"
                        onClick={() => updateField('plant', plant.id)}
                        className={`px-3 py-3 rounded-lg text-left border transition-all ${
                          form.plant === plant.id
                            ? 'border-ant-sx bg-ant-sx-light text-ant-sx-dark'
                            : 'border-gray-200 bg-ant-bg text-ant-text-secondary hover:border-gray-300'
                        }`}
                      >
                        <span className="text-sm font-medium">{plant.name}</span>
                        <p className="text-xxs text-ant-text-secondary mt-0.5">Mã: {plant.code}</p>
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="text-sm font-semibold text-ant-text mb-2">Chọn bộ phận <span className="text-ant-error">*</span></legend>
                  <div className="grid grid-cols-2 gap-2">
                    {DEPARTMENTS.map((dept) => (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => updateField('department', dept.id)}
                        className={`px-3 py-2.5 rounded-lg text-left text-xs font-medium border transition-all ${
                          form.department === dept.id
                            ? 'border-ant-sx bg-ant-sx-light text-ant-sx-dark'
                            : 'border-gray-200 bg-ant-bg text-ant-text-secondary hover:border-gray-300'
                        }`}
                      >
                        {dept.name}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            </div>

            {/* Agreement */}
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => { setAgreed(e.target.checked); setError(''); }}
                className="w-4 h-4 mt-0.5 rounded-md border-gray-300 text-ant-sx focus:ring-ant-sx cursor-pointer shrink-0"
              />
              <span className="text-xs text-ant-text-secondary leading-relaxed">
                Tôi xác nhận tài khoản này dùng cho <strong>môi trường mô phỏng</strong>. Dữ liệu không có giá trị thực tế và có thể bị reset bất kỳ lúc nào.
              </span>
            </label>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5">
                <i className="ri-error-warning-line text-ant-error text-base mt-0.5 shrink-0" />
                <p className="text-xs text-red-700 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-ant-sx text-white text-sm font-bold hover:bg-ant-sx-dark active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang đăng ký...</span>
                </>
              ) : (
                <>
                  <i className="ri-user-add-line" />
                  <span>Đăng ký</span>
                </>
              )}
            </button>

            <div className="text-center pb-6">
              <p className="text-xs text-ant-text-secondary">
                Đã có tài khoản?{' '}
                <Link to="/login" className="text-ant-sx font-semibold hover:text-ant-sx-dark">
                  Đăng nhập
                </Link>
              </p>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

function FieldWrapper({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-ant-text mb-1.5">
        {label}
        {required && <span className="text-ant-error ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}