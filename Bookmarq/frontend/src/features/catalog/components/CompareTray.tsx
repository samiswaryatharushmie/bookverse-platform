import { useState } from 'react';
import { useCompareTray } from '../hooks/useCompareTray';
import { X, ExternalLink, Trash2, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function CompareTray() {
  const { compareItems, removeFromCompare, clearCompare } = useCompareTray();
  const [showModal, setShowModal] = useState(false);

  if (compareItems.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-bg-elevated)] border-t border-[var(--color-border)] shadow-[0_-4px_20px_rgba(0,0,0,0.2)] animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-sm">Compare ({compareItems.length}/3)</span>
            <div className="flex gap-2">
              {compareItems.map(item => (
                <div key={item.id} className="flex items-center gap-2 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded p-1 pr-2">
                  <div className="w-6 h-8 bg-black overflow-hidden rounded-sm">
                    {item.coverUrl ? (
                      <img src={item.coverUrl.startsWith('http') ? item.coverUrl : `http://localhost:8080${item.coverUrl}`} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full bg-[var(--color-accent)]" />
                    )}
                  </div>
                  <span className="text-xs max-w-[100px] truncate">{item.title}</span>
                  <button onClick={() => removeFromCompare(item.id)} className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)]">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
            <button 
              onClick={(e) => {
                e.preventDefault();
                const shareUrl = `${window.location.origin}/compare?books=${compareItems.map(i => i.id).join(',')}`;
                navigator.clipboard.writeText(shareUrl);
                toast.success('Shareable list link copied to clipboard!');
              }}
              className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] flex items-center gap-1"
            >
               <Share2 size={12} /> Share List
            </button>
            <button onClick={clearCompare} className="text-xs text-[var(--color-text-muted)] hover:text-white flex items-center gap-1">
               <Trash2 size={12} /> Clear all
            </button>
            <button 
              onClick={() => setShowModal(true)} 
              disabled={compareItems.length < 2}
              className="btn btn-primary py-1.5 px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Compare
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="bg-[var(--color-bg-elevated)] rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-bg-elevated)] z-10">
              <h2 className="text-xl font-bold">Compare Books</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--color-text-muted)] hover:text-white p-2">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="w-1/4 p-4 border-b border-[var(--color-border)]">Feature</th>
                    {compareItems.map(item => (
                      <th key={item.id} className="p-4 border-b border-[var(--color-border)] min-w-[200px] w-1/4 align-top">
                        <div className="aspect-[2/3] w-24 mb-3 rounded overflow-hidden mx-auto shadow">
                           {item.coverUrl ? (
                            <img src={item.coverUrl.startsWith('http') ? item.coverUrl : `http://localhost:8080${item.coverUrl}`} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full bg-[var(--color-accent)]" />
                          )}
                        </div>
                        <div className="text-center">
                          <Link to={`/book/${item.slug}`} className="hover:text-[var(--color-accent)] hover:underline flex items-center justify-center gap-1">
                            {item.title} <ExternalLink size={12} />
                          </Link>
                          <div className="text-xs text-[var(--color-text-muted)] mt-1 font-normal">{item.authors?.map(a => a.name).join(', ')}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="hover:bg-[var(--color-bg-surface)]">
                    <td className="p-4 border-b border-[var(--color-border)] font-medium text-[var(--color-text-muted)]">Price</td>
                    {compareItems.map(item => (
                      <td key={item.id} className="p-4 border-b border-[var(--color-border)] font-bold text-center">LKR {item.price.toFixed(2)}</td>
                    ))}
                  </tr>

                  <tr className="hover:bg-[var(--color-bg-surface)]">
                    <td className="p-4 border-b border-[var(--color-border)] font-medium text-[var(--color-text-muted)]">Rating</td>
                    {compareItems.map(item => (
                      <td key={item.id} className="p-4 border-b border-[var(--color-border)] text-center">{item.avgRating?.toFixed(1) || 'N/A'} ({item.ratingCount || 0} reviews)</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[var(--color-bg-surface)]">
                    <td className="p-4 border-b border-[var(--color-border)] font-medium text-[var(--color-text-muted)]">Page Count</td>
                    {compareItems.map(item => (
                      <td key={item.id} className="p-4 border-b border-[var(--color-border)] text-center">{item.pageCount || 'Unknown'} pages</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[var(--color-bg-surface)]">
                    <td className="p-4 border-b border-[var(--color-border)] font-medium text-[var(--color-text-muted)]">Language</td>
                    {compareItems.map(item => (
                      <td key={item.id} className="p-4 border-b border-[var(--color-border)] text-center uppercase">{item.language || 'N/A'}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[var(--color-bg-surface)]">
                    <td className="p-4 border-b border-[var(--color-border)] font-medium text-[var(--color-text-muted)]">Publisher</td>
                    {compareItems.map(item => (
                      <td key={item.id} className="p-4 border-b border-[var(--color-border)] text-center">{item.publisher || 'Unknown'}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[var(--color-bg-surface)]">
                    <td className="p-4 font-medium text-[var(--color-text-muted)]">Description</td>
                    {compareItems.map(item => (
                      <td key={item.id} className="p-4 text-xs leading-relaxed text-center italic text-[var(--color-text-muted)]">{item.description ? item.description.substring(0, 150) + '...' : 'No description'}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
