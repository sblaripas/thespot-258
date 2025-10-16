import React, { useState } from 'react';
import { 
  Receipt, Image, FileText, Store,
  Save, Edit
} from 'lucide-react';

interface ReceiptSettings {
  emailedReceipt: {
    enabled: boolean;
    logo: string | null;
  };
  printedReceipt: {
    enabled: boolean;
    logo: string | null;
  };
  loopReceipts: boolean;
  header: string;
  footer: string;
  showCustomerInfo: boolean;
  showComments: boolean;
  language: string;
  store: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

const ReceiptSettingsComponent: React.FC = () => {
  const [settings, setSettings] = useState<ReceiptSettings>({
    emailedReceipt: {
      enabled: true,
      logo: null
    },
    printedReceipt: {
      enabled: true,
      logo: null
    },
    loopReceipts: false,
    header: '',
    footer: '',
    showCustomerInfo: false,
    showComments: false,
    language: 'English',
    store: {
      name: '',
      address: '',
      phone: '',
      email: ''
    }
  });

  const [isDirty, setIsDirty] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(true);

  const languages = [
    'English',
    'Portuguese',
    'Spanish',
    'French',
    'German',
    'Italian',
    'Chinese',
    'Japanese'
  ];

  const handleLogoUpload = (type: 'emailedReceipt' | 'printedReceipt', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSettings(prev => ({
          ...prev,
          [type]: {
            ...prev[type],
            logo: e.target?.result as string
          }
        }));
        setIsDirty(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeaderChange = (value: string) => {
    if (value.length <= 500) {
      setSettings(prev => ({ ...prev, header: value }));
      setIsDirty(true);
    }
  };

  const handleFooterChange = (value: string) => {
    if (value.length <= 500) {
      setSettings(prev => ({ ...prev, footer: value }));
      setIsDirty(true);
    }
  };

  const handleToggle = (field: keyof ReceiptSettings) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
    setIsDirty(true);
  };

  const handleLanguageChange = (language: string) => {
    setSettings(prev => ({ ...prev, language }));
    setIsDirty(true);
  };

  const handleSave = () => {
    console.log('Saving settings:', settings);
    setIsDirty(false);
    setIsEditing(false);
    setShowPreview(true);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowPreview(false);
  };

  const handleCancel = () => {
    if (isDirty && !confirm('You have unsaved changes. Are you sure you want to discard them?')) {
      return;
    }
    setIsDirty(false);
    if (!showPreview) {
      setIsEditing(true);
    }
  };

  const ReceiptPreview = () => (
    <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md mx-auto">
      <div className="border-2 border-slate-200 rounded-lg p-6 bg-white">
        {/* Logo */}
        {(settings.emailedReceipt.logo || settings.printedReceipt.logo) && (
          <div className="flex justify-center mb-4">
            <img 
              src={settings.emailedReceipt.logo || settings.printedReceipt.logo || ''} 
              alt="Receipt logo" 
              className="max-w-32 max-h-24 object-contain"
            />
          </div>
        )}

        {/* Store Info */}
        {settings.store.name && (
          <div className="text-center mb-4 border-b border-slate-200 pb-4">
            <h3 className="font-bold text-lg text-slate-800">{settings.store.name}</h3>
            {settings.store.address && (
              <p className="text-sm text-slate-600">{settings.store.address}</p>
            )}
            {settings.store.phone && (
              <p className="text-sm text-slate-600">Tel: {settings.store.phone}</p>
            )}
            {settings.store.email && (
              <p className="text-sm text-slate-600">{settings.store.email}</p>
            )}
          </div>
        )}

        {/* Header */}
        {settings.header && (
          <div className="mb-4 text-center border-b border-slate-200 pb-4">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{settings.header}</p>
          </div>
        )}

        {/* Receipt Details */}
        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Receipt #:</span>
            <span className="font-mono text-slate-800">12345</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Date:</span>
            <span className="text-slate-800">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Time:</span>
            <span className="text-slate-800">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Customer Info */}
        {settings.showCustomerInfo && (
          <div className="mb-4 border-t border-slate-200 pt-4">
            <p className="text-sm font-semibold text-slate-700 mb-1">Customer:</p>
            <p className="text-sm text-slate-600">John Doe</p>
            <p className="text-sm text-slate-600">customer@example.com</p>
          </div>
        )}

        {/* Items */}
        <div className="border-t border-slate-200 pt-4 mb-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-700">Sample Item 1</span>
              <span className="text-slate-800">$10.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-700">Sample Item 2</span>
              <span className="text-slate-800">$25.00</span>
            </div>
          </div>
        </div>

        {/* Comments */}
        {settings.showComments && (
          <div className="mb-4 border-t border-slate-200 pt-4">
            <p className="text-sm font-semibold text-slate-700 mb-1">Comments:</p>
            <p className="text-sm text-slate-600 italic">Thank you for your purchase!</p>
          </div>
        )}

        {/* Total */}
        <div className="border-t-2 border-slate-800 pt-4 mb-4">
          <div className="flex justify-between">
            <span className="font-bold text-slate-800">TOTAL:</span>
            <span className="font-bold text-slate-800">$35.00</span>
          </div>
        </div>

        {/* Footer */}
        {settings.footer && (
          <div className="text-center border-t border-slate-200 pt-4">
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{settings.footer}</p>
          </div>
        )}

        {/* Language indicator */}
        <div className="text-center mt-4 text-xs text-slate-400">
          Language: {settings.language}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="flex-none bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Receipt className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-white">Receipt Settings</h1>
                <p className="text-slate-400 text-xs">Configure receipt appearance and content</p>
              </div>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  EDIT
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {showPreview ? (
              <div>
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Receipt Preview</h2>
                  <p className="text-slate-600">This is how your receipt will appear to customers</p>
                </div>
                <ReceiptPreview />
              </div>
            ) : (
              <>
            {/* Logo Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-6">Logo</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Emailed Receipt */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-slate-600 font-medium">Emailed receipt</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailedReceipt.enabled}
                        onChange={() => {
                          setSettings(prev => ({
                            ...prev,
                            emailedReceipt: {
                              ...prev.emailedReceipt,
                              enabled: !prev.emailedReceipt.enabled
                            }
                          }));
                          setIsDirty(true);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                  <div className="relative w-full h-48 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center hover:border-slate-400 transition-colors cursor-pointer group">
                    {settings.emailedReceipt.logo ? (
                      <img 
                        src={settings.emailedReceipt.logo} 
                        alt="Email logo" 
                        className="max-w-full max-h-full object-contain p-4"
                      />
                    ) : (
                      <>
                        <Image className="w-16 h-16 text-slate-400 mb-2" />
                        <span className="text-slate-500 text-sm">Click to upload</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload('emailedReceipt', e)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Printed Receipt */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-slate-600 font-medium">Printed receipt</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.printedReceipt.enabled}
                        onChange={() => {
                          setSettings(prev => ({
                            ...prev,
                            printedReceipt: {
                              ...prev.printedReceipt,
                              enabled: !prev.printedReceipt.enabled
                            }
                          }));
                          setIsDirty(true);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                  <div className="relative w-full h-48 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center hover:border-slate-400 transition-colors cursor-pointer group">
                    {settings.printedReceipt.logo ? (
                      <img 
                        src={settings.printedReceipt.logo} 
                        alt="Print logo" 
                        className="max-w-full max-h-full object-contain p-4"
                      />
                    ) : (
                      <>
                        <Image className="w-16 h-16 text-slate-400 mb-2" />
                        <span className="text-slate-500 text-sm">Click to upload</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload('printedReceipt', e)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Loop Receipts Toggle */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Loop receipts</h3>
                  <p className="text-slate-500 text-sm mt-1">Enable continuous receipt printing mode</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.loopReceipts}
                    onChange={() => handleToggle('loopReceipts')}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>

            {/* Header Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-lg font-semibold text-slate-800">Header</label>
                <span className="text-sm text-slate-500">{settings.header.length} / 500</span>
              </div>
              <textarea
                value={settings.header}
                onChange={(e) => handleHeaderChange(e.target.value)}
                placeholder="Enter receipt header text..."
                className="w-full h-32 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-slate-800"
              />
            </div>

            {/* Footer Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-lg font-semibold text-slate-800">Footer</label>
                <span className="text-sm text-slate-500">{settings.footer.length} / 500</span>
              </div>
              <textarea
                value={settings.footer}
                onChange={(e) => handleFooterChange(e.target.value)}
                placeholder="Enter receipt footer text..."
                className="w-full h-32 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-slate-800"
              />
            </div>

            {/* Customer Information Settings */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Customer Information</h2>
              
              <div className="flex items-center justify-between py-3 border-b border-slate-200">
                <label className="text-slate-700">Show customer info</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showCustomerInfo}
                    onChange={() => handleToggle('showCustomerInfo')}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-slate-200">
                <label className="text-slate-700">Show comments</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showComments}
                    onChange={() => handleToggle('showComments')}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="pt-2">
                <label className="text-slate-600 text-sm mb-2 block">Receipt language</label>
                <select
                  value={settings.language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 bg-white"
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Store Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <Store className="w-6 h-6 text-slate-600" />
                <h2 className="text-xl font-semibold text-slate-800">Store Information</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-slate-600 text-sm mb-2 block">Store name</label>
                  <input
                    type="text"
                    value={settings.store.name}
                    onChange={(e) => {
                      setSettings(prev => ({
                        ...prev,
                        store: { ...prev.store, name: e.target.value }
                      }));
                      setIsDirty(true);
                    }}
                    placeholder="Enter store name"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-slate-600 text-sm mb-2 block">Address</label>
                  <input
                    type="text"
                    value={settings.store.address}
                    onChange={(e) => {
                      setSettings(prev => ({
                        ...prev,
                        store: { ...prev.store, address: e.target.value }
                      }));
                      setIsDirty(true);
                    }}
                    placeholder="Enter store address"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-600 text-sm mb-2 block">Phone</label>
                    <input
                      type="tel"
                      value={settings.store.phone}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          store: { ...prev.store, phone: e.target.value }
                        }));
                        setIsDirty(true);
                      }}
                      placeholder="Enter phone number"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 text-sm mb-2 block">Email</label>
                    <input
                      type="email"
                      value={settings.store.email}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          store: { ...prev.store, email: e.target.value }
                        }));
                        setIsDirty(true);
                      }}
                      placeholder="Enter store email"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>
              </>
            )}
          </div>
        </div>

        {/* Fixed Footer Actions */}
        {isEditing && (
        <div className="flex-none bg-white border-t border-slate-200 p-4 shadow-lg">
          <div className="max-w-4xl mx-auto flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={handleSave}
              disabled={!isDirty}
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                isDirty
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              SAVE
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptSettingsComponent;