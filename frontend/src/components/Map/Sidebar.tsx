import React from 'react';

interface FilterState {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    filterHitStatus: string;
    setFilterHitStatus: (value: string) => void;
    minCapacity: number;
    setMinCapacity: (value: number) => void;
    minGasCapacity: number;
    setMinGasCapacity: (value: number) => void;
    showRefinery: boolean;
    setShowRefinery: (value: boolean) => void;
    showExtraction: boolean;
    setShowExtraction: (value: boolean) => void;
    showStorage: boolean;
    setShowStorage: (value: boolean) => void;
}

interface SidebarProps {
    filteredCount: number;
    totalCount: number;
    filterState: FilterState;
}

export const Sidebar: React.FC<SidebarProps> = ({ filteredCount, totalCount, filterState }) => {
    const {
        searchTerm, setSearchTerm,
        filterHitStatus, setFilterHitStatus,
        minCapacity, setMinCapacity,
        minGasCapacity, setMinGasCapacity,
        showRefinery, setShowRefinery,
        showExtraction, setShowExtraction,
        showStorage, setShowStorage
    } = filterState;

    return (
        <div style={{ 
            width: '280px', 
            background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1e 100%)',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '2px 0 15px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Sidebar Header */}
            <div style={{ 
                padding: '18px 20px', 
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'linear-gradient(135deg, #2d3561 0%, #1f2749 100%)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}>
                <h2 style={{ 
                    margin: '0 0 6px 0', 
                    fontSize: '18px', 
                    fontWeight: '700', 
                    color: 'white',
                    letterSpacing: '0.3px'
                }}>
                    Russian Oil Facilities
                </h2>
                <p style={{ 
                    margin: 0, 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    fontSize: '13px',
                    fontWeight: '500'
                }}>
                    {filteredCount} of {totalCount} facilities
                </p>
            </div>

            {/* Filters */}
            <div style={{ 
                flex: 1,
                overflowY: 'auto',
                padding: '16px 20px'
            }}>
                {/* Search */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        fontSize: '12px', 
                        color: '#a0aec0', 
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px'
                    }}>
                        Search
                    </label>
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            backgroundColor: 'rgba(10, 10, 10, 0.5)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box',
                            transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'rgba(96, 165, 250, 0.5)'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                    />
                </div>

                {/* Status Filter */}
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ 
                        fontSize: '12px', 
                        color: '#a0aec0', 
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        marginBottom: '8px'
                    }}>
                        Status
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px', 
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '4px',
                            transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <input 
                                type="checkbox" 
                                checked={filterHitStatus === 'all' || filterHitStatus === 'hit'} 
                                onChange={(e) => {
                                    if (filterHitStatus === 'hit') {
                                        setFilterHitStatus('all');
                                    } else {
                                        setFilterHitStatus('hit');
                                    }
                                }}
                                style={{ 
                                    cursor: 'pointer',
                                    width: '16px',
                                    height: '16px',
                                    accentColor: '#6b7280'
                                }}
                            />
                            <span style={{ fontSize: '13px', color: '#cbd5e0', fontWeight: '500' }}>Hit</span>
                        </label>
                        <label style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px', 
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '4px',
                            transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <input 
                                type="checkbox" 
                                checked={filterHitStatus === 'all' || filterHitStatus === 'operational'} 
                                onChange={(e) => {
                                    if (filterHitStatus === 'operational') {
                                        setFilterHitStatus('all');
                                    } else {
                                        setFilterHitStatus('operational');
                                    }
                                }}
                                style={{ 
                                    cursor: 'pointer',
                                    width: '16px',
                                    height: '16px',
                                    accentColor: '#6b7280'
                                }}
                            />
                            <span style={{ fontSize: '13px', color: '#cbd5e0', fontWeight: '500' }}>Operational</span>
                        </label>
                    </div>
                </div>

                {/* Minimum Oil Capacity */}
                <div style={{ marginBottom: '12px' }}>
                    <label style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '6px', 
                        fontSize: '12px', 
                        color: '#a0aec0', 
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px'
                    }}>
                        <span>Min. Oil</span>
                        <span style={{ color: '#9ca3af', fontSize: '11px' }}>{minCapacity.toLocaleString()} bbl/d</span>
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="400000"
                        step="10000"
                        value={minCapacity}
                        onChange={(e) => setMinCapacity(Number(e.target.value))}
                        style={{
                            width: '100%',
                            cursor: 'pointer',
                            accentColor: '#6b7280',
                            height: '4px'
                        }}
                    />
                </div>

                {/* Minimum Gas Capacity */}
                <div style={{ marginBottom: '12px' }}>
                    <label style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '6px', 
                        fontSize: '12px', 
                        color: '#a0aec0', 
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px'
                    }}>
                        <span>Min. Gas</span>
                        <span style={{ color: '#9ca3af', fontSize: '11px' }}>{minGasCapacity.toLocaleString()} m³/yr</span>
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="30000000000"
                        step="1000000000"
                        value={minGasCapacity}
                        onChange={(e) => setMinGasCapacity(Number(e.target.value))}
                        style={{
                            width: '100%',
                            cursor: 'pointer',
                            accentColor: '#6b7280',
                            height: '4px'
                        }}
                    />
                </div>

                {/* Facility Types Legend */}
                <div style={{ 
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    paddingTop: '12px',
                    marginTop: '12px'
                }}>
                    <div style={{ 
                        fontSize: '12px', 
                        color: '#a0aec0', 
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        marginBottom: '6px'
                    }}>
                        Facility Types
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <label style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <input 
                                type="checkbox" 
                                checked={showRefinery} 
                                onChange={(e) => setShowRefinery(e.target.checked)}
                                style={{ 
                                    cursor: 'pointer',
                                    width: '14px',
                                    height: '14px',
                                    accentColor: '#6b7280'
                                }}
                            />
                            <span style={{ 
                                display: 'inline-block',
                                width: '12px', 
                                height: '12px', 
                                backgroundColor: '#1cc5b7ff',
                                borderRadius: '50%'
                            }}></span>
                            <span style={{ fontSize: '12px', color: '#cbd5e0', fontWeight: '500' }}>Refinery</span>
                        </label>
                        <label style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <input 
                                type="checkbox" 
                                checked={showExtraction} 
                                onChange={(e) => setShowExtraction(e.target.checked)}
                                style={{ 
                                    cursor: 'pointer',
                                    width: '14px',
                                    height: '14px',
                                    accentColor: '#6b7280'
                                }}
                            />
                            <span style={{ 
                                display: 'inline-block',
                                width: '12px', 
                                height: '12px', 
                                backgroundColor: '#8B5CF6',
                                borderRadius: '50%'
                            }}></span>
                            <span style={{ fontSize: '12px', color: '#cbd5e0', fontWeight: '500' }}>Extraction</span>
                        </label>
                        <label style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <input 
                                type="checkbox" 
                                checked={showStorage} 
                                onChange={(e) => setShowStorage(e.target.checked)}
                                style={{ 
                                    cursor: 'pointer',
                                    width: '14px',
                                    height: '14px',
                                    accentColor: '#6b7280'
                                }}
                            />
                            <span style={{ 
                                display: 'inline-block',
                                width: '12px', 
                                height: '12px', 
                                backgroundColor: '#F59E0B',
                                borderRadius: '50%'
                            }}></span>
                            <span style={{ fontSize: '12px', color: '#cbd5e0', fontWeight: '500' }}>Storage</span>
                        </label>
                    </div>
                </div>

                {/* Damage Legend */}
                <div style={{ 
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    paddingTop: '12px',
                    marginTop: '12px'
                }}>
                    <div style={{ 
                        fontSize: '12px', 
                        color: '#a0aec0', 
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        marginBottom: '4px'
                    }}>
                        Damage Level
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '4px' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px',
                                flex: '1'
                            }}>
                                <span style={{ 
                                    display: 'inline-block',
                                    width: '12px', 
                                    height: '12px', 
                                    backgroundColor: '#1cc5b7ff',
                                    borderRadius: '50%',
                                    border: '2px solid white',
                                    boxSizing: 'border-box'
                                }}></span>
                                <span style={{ fontSize: '12px', color: '#cbd5e0', fontWeight: '500' }}>0%</span>
                            </div>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px',
                                flex: '1'
                            }}>
                                <span style={{ 
                                    display: 'inline-block',
                                    width: '12px', 
                                    height: '12px', 
                                    backgroundColor: '#1cc5b7ff',
                                    borderRadius: '50%',
                                    border: '3px solid #F59E0B',
                                    boxSizing: 'border-box'
                                }}></span>
                                <span style={{ fontSize: '12px', color: '#cbd5e0', fontWeight: '500' }}>1-39%</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px',
                                flex: '1'
                            }}>
                                <span style={{ 
                                    display: 'inline-block',
                                    width: '12px', 
                                    height: '12px', 
                                    backgroundColor: '#1cc5b7ff',
                                    borderRadius: '50%',
                                    border: '3px solid #DC2626',
                                    boxSizing: 'border-box'
                                }}></span>
                                <span style={{ fontSize: '12px', color: '#cbd5e0', fontWeight: '500' }}>40-79%</span>
                            </div>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px',
                                flex: '1'
                            }}>
                                <span style={{ 
                                    display: 'inline-block',
                                    width: '12px', 
                                    height: '12px', 
                                    backgroundColor: '#1cc5b7ff',
                                    borderRadius: '50%',
                                    border: '3px solid #000000',
                                    boxSizing: 'border-box'
                                }}></span>
                                <span style={{ fontSize: '12px', color: '#cbd5e0', fontWeight: '500' }}>80-100%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weapon Ranges Legend */}
                <div style={{ 
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    paddingTop: '12px',
                    marginTop: '12px'
                }}>
                    <div style={{ 
                        fontSize: '12px', 
                        color: '#a0aec0', 
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        marginBottom: '6px'
                    }}>
                        Weapon Ranges (km)
                    </div>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: '16px', 
                        padding: '4px',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ color: '#10B981', fontSize: '14px' }}>■</span>
                            <span style={{ fontSize: '12px', color: '#cbd5e0', fontWeight: '500' }}>500</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ color: '#F97316', fontSize: '14px' }}>■</span>
                            <span style={{ fontSize: '12px', color: '#cbd5e0', fontWeight: '500' }}>1000</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ color: '#EF4444', fontSize: '14px' }}>■</span>
                            <span style={{ fontSize: '12px', color: '#cbd5e0', fontWeight: '500' }}>1500</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ color: '#3B82F6', fontSize: '14px' }}>■</span>
                            <span style={{ fontSize: '12px', color: '#cbd5e0', fontWeight: '500' }}>2000</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
