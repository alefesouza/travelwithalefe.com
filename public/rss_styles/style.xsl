<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">
<xsl:template match="child::rss/channel">
	<html>
	<head>
		<link href="/rss_styles/style.css" rel="stylesheet" type="text/css" />

			<meta name="viewport" content="width=device-width, initial-scale=1" />
	</head>
	<body>

		<header>
			<div>
				<a href="/">
					<xsl:element name="img">
						<xsl:attribute name="src">/images/banner.png</xsl:attribute>
						<xsl:attribute name="srcset">/images/banner-2x.png 2x</xsl:attribute>
						<xsl:attribute name="width">325</xsl:attribute>
						<xsl:attribute name="height">68</xsl:attribute>
					</xsl:element>
				</a>
			</div>
			<h1>
				<xsl:element name="a">
					<xsl:attribute name="href">
						<xsl:value-of select="link" />
					</xsl:attribute>
					<xsl:value-of select="title" />
				</xsl:element>
			</h1>
			<span>
				<xsl:value-of select="description" />
			</span>
			<h2>
				<xsl:choose>
					<xsl:when test="(language='pt-BR')">
						Assine esse feed
					</xsl:when>
					<xsl:otherwise>
						Subscribe to this feed
					</xsl:otherwise>
				</xsl:choose>
			</h2>
			<p>
				<xsl:choose>
					<xsl:when test="(language='pt-BR')">
						Clique no botão abaixo e adicione o esse feed ao seu leitor favorito de RSS.
					</xsl:when>
					<xsl:otherwise>
						Click the button below and add this feed to your favorite RSS reader.
					</xsl:otherwise>
				</xsl:choose>
			</p>

			<xsl:element name="span">
				<xsl:attribute name="class">
					rss copy
				</xsl:attribute>
				<xsl:element name="img">
					<xsl:attribute name="src">/images/rss.svg</xsl:attribute>
					<xsl:attribute name="width">12</xsl:attribute>
					<xsl:attribute name="height">12</xsl:attribute>
				</xsl:element>
				<xsl:choose>
					<xsl:when test="(language='pt-BR')">
						Copiar url do feed
					</xsl:when>
					<xsl:otherwise>
						Copy feed url
					</xsl:otherwise>
				</xsl:choose>
			</xsl:element>

			<xsl:element name="a">
				<xsl:attribute name="href" >
						https://feedly.com/i/subscription/feed/<xsl:value-of select="atom:link/@href"/>
				</xsl:attribute>
				<xsl:attribute name="class">
					rss
				</xsl:attribute>
				<xsl:element name="img">
					<xsl:attribute name="src">/images/rss.svg</xsl:attribute>
					<xsl:attribute name="width">12</xsl:attribute>
					<xsl:attribute name="height">12</xsl:attribute>
				</xsl:element>
				Feedly - RSS
			</xsl:element>
		</header>
		<ul>
			<xsl:for-each select="item">
				<li>
					<h2>
						<xsl:element name="a" >
							<xsl:attribute name="href"><xsl:value-of select="link"/></xsl:attribute>
							<xsl:attribute name="target">_blank</xsl:attribute>
							<xsl:value-of select="title" />
						</xsl:element>
					</h2>
					<span class="date"><xsl:value-of select="pubDate" /></span>

					<p>
						<xsl:if test="(media:content/@medium='image')">
							<xsl:element name="img">
								<xsl:attribute name="src"><xsl:value-of select="media:content/@url"/></xsl:attribute>
								<xsl:attribute name="loading">lazy</xsl:attribute>
							</xsl:element>
						</xsl:if>
						<xsl:if test="(media:content/@medium='video')">
							<xsl:element name="video">
								<xsl:attribute name="src"><xsl:value-of select="media:content/@url"/></xsl:attribute>
								<xsl:attribute name="poster"><xsl:value-of select="media:content/media:thumbnail/@url"/></xsl:attribute>
								<xsl:attribute name="controls" />
							</xsl:element>
						</xsl:if>
					</p>

					<p><xsl:value-of select="description" disable-output-escaping="yes" /></p>
				</li>
			</xsl:for-each>
		</ul>

		<script language="javascript">
			<xsl:comment>
				document.querySelector('.copy').addEventListener('click', function(e) {
					e.preventDefault();

					const clipBoard = navigator.clipboard;
					clipBoard
						.writeText(window.location.href)
						.then(() => {
							alert(window.location.host.includes('viajarcomale.com.br') ? 'Link copiado para a área de transferência.' : 'Link copied to clipboard.');
						});
				});
		    </xsl:comment>
	    </script>

	</body>
	</html>
</xsl:template>
</xsl:stylesheet>
