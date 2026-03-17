"""
AI Watch - Newsletter Module
V2: Generates and sends HTML newsletters via SMTP.
"""
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from collections import Counter
from dotenv import load_dotenv

load_dotenv()


def get_smtp_config():
    """Load SMTP configuration from environment."""
    config = {
        'host': os.getenv('SMTP_HOST', 'smtp.gmail.com'),
        'port': int(os.getenv('SMTP_PORT', 587)),
        'username': os.getenv('SMTP_USERNAME'),
        'password': os.getenv('SMTP_PASSWORD'),
        'from_email': os.getenv('SMTP_FROM_EMAIL'),
        'to_emails': os.getenv('NEWSLETTER_RECIPIENTS', '').split(',')
    }
    return config


def generate_html_newsletter(sector_data, title="AI Watch Weekly Intelligence"):
    """
    Generate an HTML newsletter from sector data.
    
    Args:
        sector_data: Dict of {sector_name: [summarized_articles]}
        title: Newsletter title
    
    Returns:
        HTML string
    """
    # Calculate stats
    total_articles = sum(len(articles) for articles in sector_data.values())
    weak_signals = sum(
        1 for articles in sector_data.values() 
        for a in articles if 'Weak' in a.get('signal_type', '')
    )
    high_relevance = sum(
        1 for articles in sector_data.values() 
        for a in articles if a.get('relevance_score', 0) >= 8
    )
    
    # Industry breakdown
    industry_counts = Counter()
    for articles in sector_data.values():
        for a in articles:
            industry = a.get('industry', 'Other')
            industry_counts[industry] += 1
    
    # Build HTML
    html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 700px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }}
        .container {{
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        .header {{
            text-align: center;
            border-bottom: 3px solid #e67e22;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }}
        .header h1 {{
            color: #e67e22;
            margin: 0;
            font-size: 28px;
        }}
        .header .date {{
            color: #666;
            font-size: 14px;
            margin-top: 5px;
        }}
        .stats {{
            display: flex;
            justify-content: space-around;
            background: linear-gradient(135deg, #e67e22, #d35400);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }}
        .stat {{
            text-align: center;
        }}
        .stat-number {{
            font-size: 32px;
            font-weight: bold;
        }}
        .stat-label {{
            font-size: 12px;
            opacity: 0.9;
        }}
        .industry-breakdown {{
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
        }}
        .industry-breakdown h3 {{
            margin-top: 0;
            color: #e67e22;
        }}
        .industry-bar {{
            display: flex;
            align-items: center;
            margin: 8px 0;
        }}
        .industry-name {{
            width: 180px;
            font-size: 13px;
        }}
        .industry-bar-fill {{
            height: 20px;
            background: linear-gradient(90deg, #e67e22, #f39c12);
            border-radius: 4px;
            min-width: 20px;
        }}
        .industry-count {{
            margin-left: 10px;
            font-size: 13px;
            color: #666;
        }}
        .sector {{
            margin-bottom: 30px;
        }}
        .sector h2 {{
            color: #2c3e50;
            border-left: 4px solid #e67e22;
            padding-left: 15px;
            margin-bottom: 20px;
        }}
        .article {{
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            border-left: 4px solid #3498db;
        }}
        .article.weak-signal {{
            border-left-color: #f1c40f;
        }}
        .article.strong-signal {{
            border-left-color: #27ae60;
        }}
        .article h3 {{
            margin: 0 0 10px 0;
            font-size: 16px;
        }}
        .article h3 a {{
            color: #2c3e50;
            text-decoration: none;
        }}
        .article h3 a:hover {{
            color: #e67e22;
        }}
        .article-meta {{
            font-size: 12px;
            color: #666;
            margin-bottom: 10px;
        }}
        .signal-badge {{
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
        }}
        .signal-weak {{
            background: #fef3cd;
            color: #856404;
        }}
        .signal-strong {{
            background: #d4edda;
            color: #155724;
        }}
        .signal-noise {{
            background: #e9ecef;
            color: #495057;
        }}
        .industry-tag {{
            display: inline-block;
            background: #e9ecef;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            color: #495057;
            margin-left: 5px;
        }}
        .article-summary {{
            font-size: 14px;
            color: #555;
        }}
        .article-summary ul {{
            margin: 10px 0;
            padding-left: 20px;
        }}
        .actors-info {{
            background: #e8f4f8;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
            font-size: 13px;
            border-left: 3px solid #17a2b8;
        }}
        .startup-info {{
            background: #fff3cd;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
            font-size: 13px;
        }}
        .funding-info {{
            background: #d1ecf1;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
            font-size: 13px;
        }}
        .footer {{
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 12px;
        }}
        .cta-button {{
            display: inline-block;
            background: #e67e22;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 10px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 {title}</h1>
            <div class="date">{datetime.now().strftime('%B %d, %Y')}</div>
        </div>
        
        <div class="stats">
            <div class="stat">
                <div class="stat-number">{total_articles}</div>
                <div class="stat-label">Articles Analyzed</div>
            </div>
            <div class="stat">
                <div class="stat-number">{weak_signals}</div>
                <div class="stat-label">Weak Signals</div>
            </div>
            <div class="stat">
                <div class="stat-number">{high_relevance}</div>
                <div class="stat-label">High Relevance</div>
            </div>
        </div>
"""
    
    # Industry breakdown
    if industry_counts:
        html += """
        <div class="industry-breakdown">
            <h3>🏭 Industry Breakdown</h3>
"""
        max_count = max(industry_counts.values()) if industry_counts else 1
        for industry, count in industry_counts.most_common():
            width = int((count / max_count) * 150)
            html += f"""
            <div class="industry-bar">
                <span class="industry-name">{industry}</span>
                <div class="industry-bar-fill" style="width: {width}px;"></div>
                <span class="industry-count">{count}</span>
            </div>
"""
        html += "        </div>\n"
    
    # V2: Funding Highlights section
    funding_entries = []
    for articles in sector_data.values():
        for a in articles:
            funding = a.get('funding', 'None')
            if funding and funding.lower() != 'none':
                for entry in funding.split(';'):
                    entry = entry.strip()
                    if entry and entry.lower() != 'none':
                        parts = [p.strip() for p in entry.split('|')]
                        if len(parts) >= 2:
                            funding_entries.append({
                                'company': parts[0],
                                'amount': parts[1] if len(parts) > 1 else 'Undisclosed',
                                'round': parts[2] if len(parts) > 2 else '',
                                'investors': parts[3] if len(parts) > 3 else ''
                            })
    
    if funding_entries:
        html += """
        <div class="industry-breakdown" style="background: #e8f5e9; border-left: 4px solid #4caf50;">
            <h3>💰 Funding Highlights</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr style="background: #c8e6c9;">
                    <th style="text-align: left; padding: 8px;">Company</th>
                    <th style="text-align: left; padding: 8px;">Amount</th>
                    <th style="text-align: left; padding: 8px;">Round</th>
                    <th style="text-align: left; padding: 8px;">Investors</th>
                </tr>
"""
        for f in funding_entries[:5]:  # Top 5 funding rounds
            html += f"""
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px;"><strong>{f['company']}</strong></td>
                    <td style="padding: 8px; color: #2e7d32;">{f['amount']}</td>
                    <td style="padding: 8px;">{f['round']}</td>
                    <td style="padding: 8px; font-size: 11px;">{f['investors']}</td>
                </tr>
"""
        html += """
            </table>
        </div>
"""
    
    # Articles by sector
    for sector, articles in sector_data.items():
        if not articles:
            continue
            
        html += f"""
        <div class="sector">
            <h2>🏷️ {sector}</h2>
"""
        # Show top 5 articles per sector
        for article in articles[:5]:
            signal_type = article.get('signal_type', 'Noise')
            signal_class = 'weak-signal' if 'Weak' in signal_type else ('strong-signal' if 'Strong' in signal_type else '')
            badge_class = 'signal-weak' if 'Weak' in signal_type else ('signal-strong' if 'Strong' in signal_type else 'signal-noise')
            
            industry = article.get('industry', 'Other')
            segment = article.get('market_segment', '')
            industry_display = f"{industry}" + (f" > {segment}" if segment and segment != 'General' else "")
            
            title = article.get('title', 'Untitled')
            url = article.get('url', '#')
            source = article.get('source', 'Unknown')
            relevance = article.get('relevance_score', 0)
            
            # Parse summary bullets
            summary = article.get('summary', 'No summary available')
            summary_html = "<ul>"
            for line in summary.split('\n'):
                line = line.strip()
                if line.startswith('-'):
                    summary_html += f"<li>{line[1:].strip()}</li>"
            summary_html += "</ul>"
            
            html += f"""
            <div class="article {signal_class}">
                <h3><a href="{url}">{title}</a></h3>
                <div class="article-meta">
                    📰 {source} | 
                    <span class="signal-badge {badge_class}">{signal_type}</span> |
                    ⭐ {relevance}/10
                    <span class="industry-tag">🏭 {industry_display}</span>
                </div>
                <div class="article-summary">
                    {summary_html}
                </div>
"""
            # Key Actors
            key_actors = article.get('key_actors', 'None')
            if key_actors and key_actors != 'None':
                html += f"""
                <div class="actors-info">
                    👥 <strong>Key Actors:</strong> {key_actors}
                </div>
"""
            # Startups
            startups = article.get('startups', 'None')
            if startups and startups != 'None':
                html += f"""
                <div class="startup-info">
                    🚀 <strong>Startups:</strong> {startups}
                </div>
"""
            # Funding
            funding = article.get('funding', 'None')
            if funding and funding != 'None':
                html += f"""
                <div class="funding-info">
                    💰 <strong>Funding:</strong> {funding}
                </div>
"""
            # Patents
            patents = article.get('patents', 'None')
            if patents and patents.lower() != 'none':
                html += f"""
                <div class="funding-info" style="background: #fff3e0; border-left: 3px solid #ff9800;">
                    📜 <strong>Patents:</strong> {patents}
                </div>
"""
            # Publications
            publications = article.get('publications', 'None')
            if publications and publications.lower() != 'none':
                html += f"""
                <div class="funding-info" style="background: #f3e5f5; border-left: 3px solid #9c27b0;">
                    📚 <strong>Publications:</strong> {publications}
                </div>
"""
            html += "            </div>\n"
        
        html += "        </div>\n"
    
    # Footer
    html += f"""
        <div class="footer">
            <p>📌 <strong>Legend:</strong> 
                <span class="signal-badge signal-weak">Weak Signal</span> Early trends |
                <span class="signal-badge signal-strong">Strong Signal</span> Established trends
            </p>
            <p>Generated by AI Watch v2.0</p>
            <p style="color: #999;">
                You received this because you're subscribed to AI Watch Intelligence Reports.
            </p>
        </div>
    </div>
</body>
</html>
"""
    
    return html


def save_newsletter_html(html_content, output_dir="reports"):
    """Save newsletter as HTML file."""
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
    filename = f"newsletter_{timestamp}.html"
    filepath = os.path.join(output_dir, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"📧 Newsletter HTML saved to: {filepath}")
    return filepath


def send_newsletter(sector_data, subject=None):
    """
    Generate and send newsletter via SMTP.
    
    Args:
        sector_data: Dict of {sector_name: [summarized_articles]}
        subject: Email subject (auto-generated if None)
    
    Returns:
        True if sent successfully, False otherwise
    """
    config = get_smtp_config()
    
    # Validate config
    if not config['username'] or not config['password']:
        print("⚠️ SMTP not configured. Saving HTML file only.")
        html = generate_html_newsletter(sector_data)
        save_newsletter_html(html)
        return False
    
    if not config['to_emails'] or config['to_emails'] == ['']:
        print("⚠️ No recipients configured (NEWSLETTER_RECIPIENTS not set)")
        html = generate_html_newsletter(sector_data)
        save_newsletter_html(html)
        return False
    
    # Generate content
    html = generate_html_newsletter(sector_data)
    
    # Save a copy
    save_newsletter_html(html)
    
    # Create email
    if subject is None:
        subject = f"🔍 AI Watch Weekly - {datetime.now().strftime('%B %d, %Y')}"
    
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = config['from_email'] or config['username']
    msg['To'] = ', '.join(config['to_emails'])
    
    # Plain text fallback
    plain_text = f"""
AI Watch Weekly Intelligence Report
{datetime.now().strftime('%B %d, %Y')}

View this email in HTML for the best experience.

Generated by AI Watch v2.0
"""
    
    msg.attach(MIMEText(plain_text, 'plain'))
    msg.attach(MIMEText(html, 'html'))
    
    # Send
    try:
        print(f"📧 Sending newsletter to {len(config['to_emails'])} recipient(s)...")
        
        with smtplib.SMTP(config['host'], config['port']) as server:
            server.starttls()
            server.login(config['username'], config['password'])
            server.send_message(msg)
        
        print(f"✅ Newsletter sent successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send newsletter: {e}")
        return False


if __name__ == "__main__":
    # Test with sample data
    test_data = {
        "AI & Machine Learning": [
            {
                'title': 'OpenAI Launches GPT-5 with Advanced Reasoning',
                'source': 'TechCrunch',
                'url': 'https://example.com/1',
                'summary': '- GPT-5 features breakthrough reasoning capabilities\n- 10x improvement in complex problem solving\n- Available via API immediately',
                'signal_type': 'Strong Signal',
                'relevance_score': 9,
                'industry': 'AI & Machine Learning',
                'market_segment': 'Foundation Models',
                'startups': 'None',
                'funding': 'None'
            },
            {
                'title': 'Emerging Startup Raises $50M for AI Agents',
                'source': 'VentureBeat',
                'url': 'https://example.com/2',
                'summary': '- AI agent startup secures Series B\n- Focus on enterprise automation\n- Plans to triple team size',
                'signal_type': 'Weak Signal',
                'relevance_score': 8,
                'industry': 'AI & Machine Learning',
                'market_segment': 'AI Agents',
                'startups': 'AgentCorp: AI automation platform',
                'funding': '$50M Series B led by Sequoia'
            }
        ]
    }
    
    # Generate and save HTML
    html = generate_html_newsletter(test_data)
    save_newsletter_html(html)
    print("✅ Test newsletter generated!")
