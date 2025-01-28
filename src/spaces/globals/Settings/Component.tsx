'use client'

import React from 'react'
import type { GlobalConfig } from 'payload'

type Props = {
  settings: Record<string, any> // We'll type this more specifically later
}

interface MenuItem {
  label: string
  link: string
}

interface SocialMediaAccount {
  platform: string
  url: string
}

export const SettingsComponent: React.FC<Props> = ({ settings }) => {
  if (!settings) return null

  return (
    <div className="settings-component">
      <div className="settings-section">
        <h2>Site Settings</h2>
        <div>
          <strong>Site Title:</strong> {settings.site?.title}
        </div>
        {settings.site?.description && (
          <div>
            <strong>Description:</strong> {settings.site?.description}
          </div>
        )}
      </div>

      {settings.mainMenu?.items?.length > 0 && (
        <div className="settings-section">
          <h2>Main Menu</h2>
          <ul>
            {settings.mainMenu.items.map((item: MenuItem, i: number) => (
              <li key={i}>
                <a href={item.link}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {settings.socialMedia?.accounts?.length > 0 && (
        <div className="settings-section">
          <h2>Social Media</h2>
          <ul>
            {settings.socialMedia.accounts.map((account: SocialMediaAccount, i: number) => (
              <li key={i}>
                <strong>{account.platform}:</strong>{' '}
                <a href={account.url} target="_blank" rel="noopener noreferrer">
                  {account.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {settings.maintenance?.enabled && (
        <div className="settings-section maintenance-mode">
          <h2>Maintenance Mode Active</h2>
          <div className="maintenance-message">{settings.maintenance.message}</div>
        </div>
      )}

      <style jsx>{`
        .settings-component {
          padding: 20px;
        }
        .settings-section {
          margin-bottom: 30px;
        }
        .settings-section h2 {
          margin-bottom: 15px;
          color: var(--theme-elevation-800);
        }
        .maintenance-mode {
          background-color: var(--theme-error-50);
          padding: 15px;
          border-radius: 4px;
        }
        ul {
          list-style: none;
          padding: 0;
        }
        li {
          margin-bottom: 10px;
        }
        a {
          color: var(--theme-primary-500);
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}

export default SettingsComponent
