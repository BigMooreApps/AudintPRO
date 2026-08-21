/**
 * Mapeo Oficial Completo de la Norma UNE-EN ISO/IEC 17025:2017
 * Incluye todos los subnumerales y requisitos auditables (Capítulos 4 a 8)
 * clasificados e interrelacionados por Áreas Funcionales de Auditoría.
 */

export const DEFAULT_AREAS = [
  {
    id: 'area-direccion-calidad',
    nombre: 'Alta Dirección y Gestión de Calidad',
    password: '1',
    color: 'indigo'
  },
  {
    id: 'area-talento-humano',
    nombre: 'Personal y Competencia Técnica',
    password: '1',
    color: 'blue'
  },
  {
    id: 'area-metrologia-equipos',
    nombre: 'Metrología, Equipos e Instalaciones',
    password: '1',
    color: 'emerald'
  },
  {
    id: 'area-compras-proveedores',
    nombre: 'Compras y Proveedores Externos',
    password: '1',
    color: 'cyan'
  },
  {
    id: 'area-servicio-cliente',
    nombre: 'Servicio al Cliente, Contratos y Muestreo',
    password: '1',
    color: 'amber'
  },
  {
    id: 'area-ensayos-calibracion',
    nombre: 'Operaciones Técnicas (Métodos y Ensayos/Calibración)',
    password: '1',
    color: 'teal'
  },
  {
    id: 'area-aseguramiento-validez',
    nombre: 'Aseguramiento de la Validez e Incertidumbre',
    password: '1',
    color: 'purple'
  },
  {
    id: 'area-emision-informes',
    nombre: 'Informes de Resultados y Control de Datos (LIMS)',
    password: '1',
    color: 'rose'
  }
];

export const DEFAULT_NUMERALES_MAPEO = [
  // ==========================================
  // CAPÍTULO 4: REQUISITOS GENERALES
  // ==========================================
  {
    id: 'num-4-1-1',
    codigo: '4.1.1',
    requisito: 'Las actividades del laboratorio se deben llevar a cabo de una manera imparcial y estructurada, y se deben gestionar para salvaguardar la imparcialidad.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-4-1-2',
    codigo: '4.1.2',
    requisito: 'La dirección del laboratorio debe estar comprometida con la imparcialidad.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-4-1-3',
    codigo: '4.1.3',
    requisito: 'El laboratorio debe ser responsable de la imparcialidad de sus actividades de laboratorio y no debe permitir presiones comerciales, financieras u otras que comprometan la imparcialidad.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-4-1-4',
    codigo: '4.1.4',
    requisito: 'El laboratorio debe identificar los riesgos a su imparcialidad de forma continua, incluidos los riesgos que surgen de sus actividades, sus relaciones o las de su personal.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-4-1-5',
    codigo: '4.1.5',
    requisito: 'Si se identifica un riesgo para la imparcialidad, el laboratorio debe tener capacidad para demostrar cómo se elimina o minimiza tal riesgo.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-4-2-1',
    codigo: '4.2.1',
    requisito: 'El laboratorio debe ser responsable, por medio de acuerdos legalmente ejecutables, de la gestión de toda la información obtenida o creada durante la realización de actividades del laboratorio e informar al cliente sobre información pública.',
    areaIds: ['area-direccion-calidad', 'area-servicio-cliente']
  },
  {
    id: 'num-4-2-2',
    codigo: '4.2.2',
    requisito: 'Cuando el laboratorio sea requerido por ley o autorizado por disposiciones contractuales para revelar información confidencial, se debe notificar al cliente, salvo que esté prohibido por ley.',
    areaIds: ['area-direccion-calidad', 'area-servicio-cliente']
  },
  {
    id: 'num-4-2-3',
    codigo: '4.2.3',
    requisito: 'La información acerca del cliente obtenida de fuentes diferentes al cliente (ej. quejas, organismos reglamentarios) debe ser confidencial entre el cliente y el laboratorio.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-4-2-4',
    codigo: '4.2.4',
    requisito: 'El personal, incluidos miembros de comités, contratistas, personal externo o individuos que actúen en nombre del laboratorio, debe mantener la confidencialidad de toda información obtenida o creada.',
    areaIds: ['area-direccion-calidad', 'area-talento-humano']
  },

  // ==========================================
  // CAPÍTULO 5: REQUISITOS RELATIVOS A LA ESTRUCTURA
  // ==========================================
  {
    id: 'num-5-1',
    codigo: '5.1',
    requisito: 'El laboratorio debe ser una entidad legal o una parte definida de una entidad legal, responsable legalmente de sus actividades de laboratorio.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-5-2',
    codigo: '5.2',
    requisito: 'El laboratorio debe identificar el personal de la dirección que tiene la responsabilidad general del laboratorio.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-5-3',
    codigo: '5.3',
    requisito: 'El laboratorio debe definir y documentar el alcance de las actividades de laboratorio que cumplen con este documento (excluyendo actividades suministradas externamente de forma continua).',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-5-4',
    codigo: '5.4',
    requisito: 'Las actividades de laboratorio se deben llevar a cabo cumpliendo los requisitos en instalaciones permanentes, sitios fuera de instalaciones permanentes, móviles o instalaciones del cliente.',
    areaIds: ['area-direccion-calidad', 'area-ensayos-calibracion']
  },
  {
    id: 'num-5-5-a',
    codigo: '5.5 a)',
    requisito: 'El laboratorio debe definir la organización y la estructura de gestión del laboratorio, su ubicación dentro de la organización matriz y relaciones entre gestión, operaciones técnicas y servicios de apoyo.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-5-5-b',
    codigo: '5.5 b)',
    requisito: 'El laboratorio debe especificar la responsabilidad, autoridad e interrelación de todo el personal que dirige, realiza o verifica el trabajo que afecta los resultados.',
    areaIds: ['area-direccion-calidad', 'area-talento-humano']
  },
  {
    id: 'num-5-5-c',
    codigo: '5.5 c)',
    requisito: 'El laboratorio debe documentar sus procedimientos en la extensión necesaria para asegurar la aplicación coherente de sus actividades y la validez de los resultados.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-5-6',
    codigo: '5.6',
    requisito: 'El laboratorio debe contar con personal con autoridad y recursos para: implementar y mejorar el sistema, identificar desviaciones, iniciar acciones preventivas/correctivas e informar a la dirección.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-5-7',
    codigo: '5.7',
    requisito: 'La dirección debe asegurar la comunicación relativa a la eficacia del sistema de gestión y mantener la integridad del sistema al planificar e implementar cambios.',
    areaIds: ['area-direccion-calidad']
  },

  // ==========================================
  // CAPÍTULO 6: REQUISITOS RELATIVOS A LOS RECURSOS
  // ==========================================
  {
    id: 'num-6-1',
    codigo: '6.1',
    requisito: 'El laboratorio debe tener disponibles el personal, las instalaciones, el equipamiento, los sistemas y los servicios de apoyo necesarios para gestionar y realizar sus actividades.',
    areaIds: ['area-direccion-calidad', 'area-metrologia-equipos']
  },
  {
    id: 'num-6-2-1',
    codigo: '6.2.1',
    requisito: 'Todo el personal del laboratorio, interno o externo, que pueda influir en las actividades debe actuar imparcialmente, ser competente y trabajar de acuerdo con el sistema de gestión.',
    areaIds: ['area-talento-humano']
  },
  {
    id: 'num-6-2-2',
    codigo: '6.2.2',
    requisito: 'El laboratorio debe documentar los requisitos de competencia para cada función (educación, calificación, formación, conocimiento técnico, habilidades y experiencia).',
    areaIds: ['area-talento-humano']
  },
  {
    id: 'num-6-2-3',
    codigo: '6.2.3',
    requisito: 'El laboratorio debe asegurarse de que el personal tiene la competencia para realizar las actividades de las cuales es responsable y para evaluar la importancia de las desviaciones.',
    areaIds: ['area-talento-humano']
  },
  {
    id: 'num-6-2-4',
    codigo: '6.2.4',
    requisito: 'La dirección del laboratorio debe comunicar al personal sus tareas, responsabilidades y autoridad.',
    areaIds: ['area-talento-humano', 'area-direccion-calidad']
  },
  {
    id: 'num-6-2-5',
    codigo: '6.2.5',
    requisito: 'El laboratorio debe tener procedimientos y conservar registros para determinar competencia, seleccionar, formar, supervisar, autorizar y realizar seguimiento al personal.',
    areaIds: ['area-talento-humano']
  },
  {
    id: 'num-6-2-6',
    codigo: '6.2.6',
    requisito: 'El laboratorio debe autorizar formalmente al personal para desarrollar/validar métodos, analizar resultados (opiniones/conformidad) e informar/revisar/autorizar resultados.',
    areaIds: ['area-talento-humano', 'area-direccion-calidad']
  },
  {
    id: 'num-6-3-1',
    codigo: '6.3.1',
    requisito: 'Las instalaciones y las condiciones ambientales deben ser adecuadas para las actividades del laboratorio y no deben afectar adversamente a la validez de los resultados.',
    areaIds: ['area-metrologia-equipos']
  },
  {
    id: 'num-6-3-2',
    codigo: '6.3.2',
    requisito: 'Se deben documentar los requisitos para las instalaciones y las condiciones ambientales necesarias para realizar las actividades de laboratorio.',
    areaIds: ['area-metrologia-equipos']
  },
  {
    id: 'num-6-3-3',
    codigo: '6.3.3',
    requisito: 'El laboratorio debe realizar el seguimiento, controlar y registrar las condiciones ambientales de acuerdo con especificaciones y métodos.',
    areaIds: ['area-metrologia-equipos', 'area-ensayos-calibracion']
  },
  {
    id: 'num-6-3-4',
    codigo: '6.3.4',
    requisito: 'Se deben implementar y revisar medidas de control de instalaciones: acceso restringido, prevención de contaminación o interferencias y separación eficaz de áreas incompatibles.',
    areaIds: ['area-metrologia-equipos']
  },
  {
    id: 'num-6-3-5',
    codigo: '6.3.5',
    requisito: 'Cuando se realicen actividades fuera del control permanente (sitios móviles, clientes), asegurar el cumplimiento de requisitos ambientales e instalaciones.',
    areaIds: ['area-metrologia-equipos', 'area-servicio-cliente']
  },
  {
    id: 'num-6-4-1',
    codigo: '6.4.1',
    requisito: 'El laboratorio debe tener acceso al equipamiento necesario (instrumentos, software, patrones, reactivos, materiales de referencia y consumibles).',
    areaIds: ['area-metrologia-equipos']
  },
  {
    id: 'num-6-4-2',
    codigo: '6.4.2',
    requisito: 'Cuando el laboratorio utilice equipamiento fuera de su control permanente, debe asegurarse de que cumpla los requisitos de esta norma.',
    areaIds: ['area-metrologia-equipos']
  },
  {
    id: 'num-6-4-3',
    codigo: '6.4.3',
    requisito: 'El laboratorio debe contar con un procedimiento para manipulación, transporte, almacenamiento, uso y mantenimiento planificado del equipamiento.',
    areaIds: ['area-metrologia-equipos']
  },
  {
    id: 'num-6-4-4',
    codigo: '6.4.4',
    requisito: 'El laboratorio debe verificar que el equipamiento cumple los requisitos especificados antes de ser instalado o reinstalado para su servicio.',
    areaIds: ['area-metrologia-equipos']
  },
  {
    id: 'num-6-4-5',
    codigo: '6.4.5',
    requisito: 'El equipo utilizado para medición debe ser capaz de lograr la exactitud de medición y/o la incertidumbre de medición requeridas para proporcionar un resultado válido.',
    areaIds: ['area-metrologia-equipos', 'area-aseguramiento-validez']
  },
  {
    id: 'num-6-4-6',
    codigo: '6.4.6',
    requisito: 'El equipo de medición debe ser calibrado cuando la exactitud/incertidumbre afecte la validez de los resultados o para establecer trazabilidad metrológica.',
    areaIds: ['area-metrologia-equipos']
  },
  {
    id: 'num-6-4-7',
    codigo: '6.4.7',
    requisito: 'El laboratorio debe establecer un programa de calibración, revisado y ajustado según sea necesario para mantener la confianza en el estado de calibración.',
    areaIds: ['area-metrologia-equipos']
  },
  {
    id: 'num-6-4-8',
    codigo: '6.4.8',
    requisito: 'Todos los equipos que requieran calibración o tengan periodo de validez deben etiquetarse, codificarse o identificarse para indicar su estado de calibración o vigencia.',
    areaIds: ['area-metrologia-equipos']
  },
  {
    id: 'num-6-4-9',
    codigo: '6.4.9',
    requisito: 'El equipo sometido a sobrecarga, uso inadecuado o que dé resultados dudosos o defectuosos debe ser puesto fuera de servicio, aislado y rotulado claramente.',
    areaIds: ['area-metrologia-equipos']
  },
  {
    id: 'num-6-4-10',
    codigo: '6.4.10',
    requisito: 'Cuando sean necesarias comprobaciones intermedias para mantener la confianza en el desempeño del equipo, se deben realizar según un procedimiento.',
    areaIds: ['area-metrologia-equipos']
  },
  {
    id: 'num-6-4-11',
    codigo: '6.4.11',
    requisito: 'Cuando los datos de calibración incluyan factores de corrección o valores de referencia, el laboratorio debe asegurar que se actualicen e implementen adecuadamente.',
    areaIds: ['area-metrologia-equipos']
  },
  {
    id: 'num-6-4-12',
    codigo: '6.4.12',
    requisito: 'El laboratorio debe tomar acciones para evitar ajustes no previstos del equipo que invalidarían los resultados.',
    areaIds: ['area-metrologia-equipos']
  },
  {
    id: 'num-6-4-13',
    codigo: '6.4.13',
    requisito: 'Se deben conservar registros de los equipos que influyen en las actividades (identificación, fabricante, número de serie, verificación, ubicación, calibraciones, mantenimiento, daños/reparaciones).',
    areaIds: ['area-metrologia-equipos']
  },
  {
    id: 'num-6-5-1',
    codigo: '6.5.1',
    requisito: 'El laboratorio debe establecer y mantener la trazabilidad metrológica de sus mediciones mediante una cadena ininterrumpida y documentada de calibraciones vinculadas a referencias apropiadas.',
    areaIds: ['area-metrologia-equipos', 'area-aseguramiento-validez']
  },
  {
    id: 'num-6-5-2',
    codigo: '6.5.2',
    requisito: 'Asegurar trazabilidad metrológica al Sistema Internacional de Unidades (SI) mediante: calibración por laboratorio competente, materiales de referencia certificados (ISO 17034) o realización directa con patrones.',
    areaIds: ['area-metrologia-equipos']
  },
  {
    id: 'num-6-5-3',
    codigo: '6.5.3',
    requisito: 'Cuando la trazabilidad al SI no sea técnicamente posible, demostrar trazabilidad mediante materiales de referencia certificados o métodos y normas de consenso reconocidas.',
    areaIds: ['area-metrologia-equipos']
  },
  {
    id: 'num-6-6-1',
    codigo: '6.6.1',
    requisito: 'El laboratorio debe asegurar que los productos y servicios suministrados externamente (incorporados a actividades, entregados al cliente o de apoyo) sean adecuados.',
    areaIds: ['area-compras-proveedores']
  },
  {
    id: 'num-6-6-2',
    codigo: '6.6.2',
    requisito: 'El laboratorio debe contar con procedimientos y registros para definir requisitos, evaluar/seleccionar/reevaluar proveedores, verificar recepción y emprender acciones derivadas.',
    areaIds: ['area-compras-proveedores']
  },
  {
    id: 'num-6-6-3',
    codigo: '6.6.3',
    requisito: 'El laboratorio debe comunicar a los proveedores externos sus requisitos para: productos/servicios a suministrar, criterios de aceptación, competencia del personal y actividades en sus instalaciones.',
    areaIds: ['area-compras-proveedores']
  },

  // ==========================================
  // CAPÍTULO 7: REQUISITOS DEL PROCESO
  // ==========================================
  {
    id: 'num-7-1-1',
    codigo: '7.1.1',
    requisito: 'Procedimiento de revisión de solicitudes, ofertas y contratos para asegurar que requisitos estén definidos, el laboratorio tenga capacidad/recursos, se informe sobre proveedores externos y métodos adecuados.',
    areaIds: ['area-servicio-cliente']
  },
  {
    id: 'num-7-1-2',
    codigo: '7.1.2',
    requisito: 'El laboratorio debe informar al cliente cuando el método solicitado por este se considere inapropiado o desactualizado.',
    areaIds: ['area-servicio-cliente', 'area-ensayos-calibracion']
  },
  {
    id: 'num-7-1-3',
    codigo: '7.1.3',
    requisito: 'Cuando el cliente solicite una declaración de conformidad, se debe definir claramente la especificación o norma y la regla de decisión acordada con el cliente.',
    areaIds: ['area-servicio-cliente', 'area-aseguramiento-validez']
  },
  {
    id: 'num-7-1-4',
    codigo: '7.1.4',
    requisito: 'Cualquier diferencia entre la solicitud/oferta y el contrato se debe resolver antes de iniciar actividades sin comprometer la integridad ni la validez.',
    areaIds: ['area-servicio-cliente']
  },
  {
    id: 'num-7-1-5',
    codigo: '7.1.5',
    requisito: 'Se debe informar oportunamente al cliente de cualquier desviación del contrato.',
    areaIds: ['area-servicio-cliente']
  },
  {
    id: 'num-7-1-6',
    codigo: '7.1.6',
    requisito: 'Si un contrato es modificado después de iniciado el trabajo, se debe repetir la revisión y comunicar a todo el personal afectado.',
    areaIds: ['area-servicio-cliente']
  },
  {
    id: 'num-7-1-7',
    codigo: '7.1.7',
    requisito: 'El laboratorio debe cooperar con los clientes para aclarar solicitudes y permitir presenciar actividades o preparar ítems de verificación.',
    areaIds: ['area-servicio-cliente']
  },
  {
    id: 'num-7-1-8',
    codigo: '7.1.8',
    requisito: 'Se deben conservar registros de las revisiones de contratos, cambios significativos y discusiones pertinentes con clientes.',
    areaIds: ['area-servicio-cliente']
  },
  {
    id: 'num-7-2-1-1',
    codigo: '7.2.1.1',
    requisito: 'El laboratorio debe usar métodos y procedimientos apropiados para todas las actividades, evaluación de incertidumbre y técnicas estadísticas de análisis.',
    areaIds: ['area-ensayos-calibracion']
  },
  {
    id: 'num-7-2-1-2',
    codigo: '7.2.1.2',
    requisito: 'Todos los métodos, procedimientos, normas, manuales e instrucciones deben mantenerse actualizados y fácilmente disponibles para el personal.',
    areaIds: ['area-ensayos-calibracion']
  },
  {
    id: 'num-7-2-1-3',
    codigo: '7.2.1.3',
    requisito: 'Asegurarse de utilizar la última versión vigente de un método (normas nacionales/internacionales) a menos que no sea apropiado o posible.',
    areaIds: ['area-ensayos-calibracion']
  },
  {
    id: 'num-7-2-1-4',
    codigo: '7.2.1.4',
    requisito: 'Cuando el cliente no especifica el método, seleccionar un método apropiado publicado (normas, revistas científicas o desarrollados internamente) e informar al cliente.',
    areaIds: ['area-ensayos-calibracion', 'area-servicio-cliente']
  },
  {
    id: 'num-7-2-1-5',
    codigo: '7.2.1.5',
    requisito: 'El laboratorio debe verificar que puede llevar a cabo apropiadamente los métodos normalizados antes de utilizarlos y conservar registros de la verificación.',
    areaIds: ['area-ensayos-calibracion']
  },
  {
    id: 'num-7-2-1-6',
    codigo: '7.2.1.6',
    requisito: 'El desarrollo de métodos debe ser una actividad planificada asignada a personal competente y con recursos adecuados.',
    areaIds: ['area-ensayos-calibracion']
  },
  {
    id: 'num-7-2-1-7',
    codigo: '7.2.1.7',
    requisito: 'Las desviaciones a los métodos solamente deben ocurrir si han sido documentadas, justificadas técnicamente, autorizadas y aceptadas por el cliente.',
    areaIds: ['area-ensayos-calibracion']
  },
  {
    id: 'num-7-2-2-1',
    codigo: '7.2.2.1',
    requisito: 'El laboratorio debe validar los métodos no normalizados, métodos desarrollados internamente y métodos normalizados modificados o fuera de su alcance.',
    areaIds: ['area-ensayos-calibracion', 'area-aseguramiento-validez']
  },
  {
    id: 'num-7-2-2-2',
    codigo: '7.2.2.2',
    requisito: 'Cuando se realicen cambios a un método validado, determinar su influencia y realizar una nueva validación si estos afectan la validación inicial.',
    areaIds: ['area-ensayos-calibracion', 'area-aseguramiento-validez']
  },
  {
    id: 'num-7-2-2-3',
    codigo: '7.2.2.3',
    requisito: 'Las características de desempeño de los métodos validados deben ser pertinentes a las necesidades del cliente y coherentes con los requisitos especificados.',
    areaIds: ['area-ensayos-calibracion', 'area-aseguramiento-validez']
  },
  {
    id: 'num-7-2-2-4',
    codigo: '7.2.2.4',
    requisito: 'El laboratorio debe conservar registros de validación: procedimiento, especificación de requisitos, características de desempeño, resultados y declaración de validez.',
    areaIds: ['area-ensayos-calibracion', 'area-aseguramiento-validez']
  },
  {
    id: 'num-7-3-1',
    codigo: '7.3.1',
    requisito: 'El laboratorio debe tener un plan y método de muestreo disponible en el sitio cuando realice muestreo, basado en métodos estadísticos apropiados.',
    areaIds: ['area-servicio-cliente', 'area-ensayos-calibracion']
  },
  {
    id: 'num-7-3-2',
    codigo: '7.3.2',
    requisito: 'El método de muestreo debe describir: selección de muestras/sitios, plan de muestreo, preparación y tratamiento de muestras.',
    areaIds: ['area-servicio-cliente', 'area-ensayos-calibracion']
  },
  {
    id: 'num-7-3-3',
    codigo: '7.3.3',
    requisito: 'Registros de datos de muestreo: fecha/hora, identificación de muestra, personal que muestrea, equipo utilizado, condiciones ambientales, diagramas de ubicación y desviaciones.',
    areaIds: ['area-servicio-cliente', 'area-ensayos-calibracion']
  },
  {
    id: 'num-7-4-1',
    codigo: '7.4.1',
    requisito: 'Procedimiento para transporte, recepción, manipulación, protección, almacenamiento, conservación y disposición/devolución de los ítems de ensayo o calibración.',
    areaIds: ['area-servicio-cliente', 'area-ensayos-calibracion']
  },
  {
    id: 'num-7-4-2',
    codigo: '7.4.2',
    requisito: 'Sistema para identificar sin ambigüedades los ítems de ensayo o calibración durante su permanencia en el laboratorio para evitar confusiones físicas o documentales.',
    areaIds: ['area-servicio-cliente', 'area-ensayos-calibracion']
  },
  {
    id: 'num-7-4-3',
    codigo: '7.4.3',
    requisito: 'Registro de desviaciones al recibir el ítem. Consultar al cliente ante anomalías e incluir descargo de responsabilidad en el informe si se procesa con desviación.',
    areaIds: ['area-servicio-cliente', 'area-emision-informes']
  },
  {
    id: 'num-7-4-4',
    codigo: '7.4.4',
    requisito: 'Cuando los ítems requieran condiciones ambientales especiales de almacenamiento o acondicionamiento, se deben mantener, monitorear y registrar.',
    areaIds: ['area-ensayos-calibracion', 'area-metrologia-equipos']
  },
  {
    id: 'num-7-5-1',
    codigo: '7.5.1',
    requisito: 'Los registros técnicos deben contener resultados, informe e información suficiente para identificar factores que afecten el resultado e incertidumbre y posibilitar la repetición del ensayo.',
    areaIds: ['area-ensayos-calibracion', 'area-emision-informes']
  },
  {
    id: 'num-7-5-2',
    codigo: '7.5.2',
    requisito: 'Trazabilidad de modificaciones a registros técnicos: conservar datos originales y modificados, fecha de corrección, aspectos corregidos y responsable de la corrección.',
    areaIds: ['area-ensayos-calibracion', 'area-emision-informes']
  },
  {
    id: 'num-7-6-1',
    codigo: '7.6.1',
    requisito: 'Identificar todas las contribuciones a la incertidumbre de medición significativas (incluidas las del muestreo) utilizando métodos apropiados de análisis.',
    areaIds: ['area-aseguramiento-validez']
  },
  {
    id: 'num-7-6-2',
    codigo: '7.6.2',
    requisito: 'Un laboratorio que realiza calibraciones (incluidas las de sus propios equipos) debe evaluar la incertidumbre de medición para todas las calibraciones.',
    areaIds: ['area-aseguramiento-validez', 'area-metrologia-equipos']
  },
  {
    id: 'num-7-6-3',
    codigo: '7.6.3',
    requisito: 'Un laboratorio que realiza ensayos debe evaluar o estimar la incertidumbre de medición basada en principios teóricos y experiencia práctica.',
    areaIds: ['area-aseguramiento-validez', 'area-ensayos-calibracion']
  },
  {
    id: 'num-7-7-1',
    codigo: '7.7.1',
    requisito: 'Procedimiento planificado para seguimiento de la validez de resultados: materiales de referencia, réplicas, comprobaciones funcionales, gráficos de control, muestras ciegas y correlaciones.',
    areaIds: ['area-aseguramiento-validez', 'area-ensayos-calibracion']
  },
  {
    id: 'num-7-7-2',
    codigo: '7.7.2',
    requisito: 'Seguimiento del desempeño mediante participación planificada en Ensayos de Aptitud (PT / ISO 17043) y/o comparaciones interlaboratorios.',
    areaIds: ['area-aseguramiento-validez']
  },
  {
    id: 'num-7-7-3',
    codigo: '7.7.3',
    requisito: 'Los datos de seguimiento de validez se deben analizar y utilizar para controlar/mejorar actividades. Si están fuera de criterios predefinidos, tomar acciones correctivas inmediatas.',
    areaIds: ['area-aseguramiento-validez', 'area-direccion-calidad']
  },
  {
    id: 'num-7-8-1-1',
    codigo: '7.8.1.1',
    requisito: 'Los resultados se deben revisar y autorizar formalmente antes de su liberación al cliente.',
    areaIds: ['area-emision-informes', 'area-direccion-calidad']
  },
  {
    id: 'num-7-8-1-2',
    codigo: '7.8.1.2',
    requisito: 'Los resultados se deben suministrar de manera exacta, clara, inequívoca y objetiva en un informe o certificado, conservándolos como registros técnicos.',
    areaIds: ['area-emision-informes']
  },
  {
    id: 'num-7-8-1-3',
    codigo: '7.8.1.3',
    requisito: 'En caso de acuerdo con el cliente para informes simplificados, la información requerida en 7.8.2 a 7.8.7 no incluida debe estar fácilmente disponible.',
    areaIds: ['area-emision-informes', 'area-servicio-cliente']
  },
  {
    id: 'num-7-8-2-1',
    codigo: '7.8.2.1',
    requisito: 'Requisitos comunes del informe: título, identificación del laboratorio, lugar de ensayo, identificación única del informe y páginas, cliente, método, descripción de la muestra, fechas, resultados y firma/autorización.',
    areaIds: ['area-emision-informes']
  },
  {
    id: 'num-7-8-2-2',
    codigo: '7.8.2.2',
    requisito: 'Responsabilidad de la información en el informe e identificación clara de datos suministrados por el cliente (con descargo de responsabilidad si afecta la validez).',
    areaIds: ['area-emision-informes', 'area-servicio-cliente']
  },
  {
    id: 'num-7-8-3-1',
    codigo: '7.8.3.1',
    requisito: 'Requisitos específicos para informes de ensayo: condiciones ambientales, declaraciones de conformidad, incertidumbre de medición (cuando aplique) y opiniones/interpretaciones.',
    areaIds: ['area-emision-informes']
  },
  {
    id: 'num-7-8-4-1',
    codigo: '7.8.4.1',
    requisito: 'Requisitos específicos para certificados de calibración: incertidumbre de medición en las mismas unidades, condiciones ambientales y declaración de trazabilidad metrológica al SI.',
    areaIds: ['area-emision-informes', 'area-metrologia-equipos']
  },
  {
    id: 'num-7-8-5',
    codigo: '7.8.5',
    requisito: 'Requisitos del informe cuando el laboratorio es responsable del muestreo: fecha de muestreo, identificación del ítem, ubicación/diagramas, método y condiciones ambientales.',
    areaIds: ['area-emision-informes', 'area-servicio-cliente']
  },
  {
    id: 'num-7-8-6-1',
    codigo: '7.8.6.1',
    requisito: 'Cuando se emitan declaraciones de conformidad, documentar y aplicar la regla de decisión acordada teniendo en cuenta el nivel de riesgo asociado.',
    areaIds: ['area-emision-informes', 'area-aseguramiento-validez']
  },
  {
    id: 'num-7-8-6-2',
    codigo: '7.8.6.2',
    requisito: 'Identificar claramente en el informe a qué resultados aplica la conformidad, qué especificaciones se cumplen o no y la regla de decisión aplicada.',
    areaIds: ['area-emision-informes']
  },
  {
    id: 'num-7-8-7-1',
    codigo: '7.8.7.1',
    requisito: 'Asegurar que solo personal autorizado exprese opiniones e interpretaciones y documentar la base técnica sobre la cual se han emitido.',
    areaIds: ['area-emision-informes', 'area-talento-humano']
  },
  {
    id: 'num-7-8-8-1',
    codigo: '7.8.8.1',
    requisito: 'Modificaciones a informes emitidos: identificar claramente cualquier cambio y la razón del cambio en una enmienda formal identificada de forma única.',
    areaIds: ['area-emision-informes']
  },
  {
    id: 'num-7-9-1',
    codigo: '7.9.1',
    requisito: 'Proceso documentado para recibir, evaluar y tomar decisiones acerca de las quejas de clientes o partes interesadas.',
    areaIds: ['area-direccion-calidad', 'area-servicio-cliente']
  },
  {
    id: 'num-7-9-3',
    codigo: '7.9.3',
    requisito: 'Descripción del proceso de recepción, validación, investigación y decisión sobre acciones a tomar ante quejas y registro de seguimiento.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-7-9-6',
    codigo: '7.9.6',
    requisito: 'La comunicación y aprobación de decisiones sobre quejas debe realizarse por personas no involucradas en las actividades que originaron la queja.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-7-10-1',
    codigo: '7.10.1',
    requisito: 'Procedimiento para gestión del trabajo no conforme: definición de responsabilidades, evaluación de impacto y riesgo, detención de trabajo, retención de informes y notificación al cliente.',
    areaIds: ['area-direccion-calidad', 'area-ensayos-calibracion']
  },
  {
    id: 'num-7-10-2',
    codigo: '7.10.2',
    requisito: 'Conservar registros del trabajo no conforme y las acciones tomadas para su resolución.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-7-10-3',
    codigo: '7.10.3',
    requisito: 'Cuando la evaluación indique que el trabajo no conforme podría recurrir, implementar acciones correctivas inmediatamente (según 8.7).',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-7-11-1',
    codigo: '7.11.1',
    requisito: 'El laboratorio debe tener acceso a los datos y a la información necesaria para llevar a cabo las actividades de laboratorio.',
    areaIds: ['area-emision-informes']
  },
  {
    id: 'num-7-11-2',
    codigo: '7.11.2',
    requisito: 'Validación de los sistemas de gestión de información (LIMS / software comercial o propio) antes de su introducción y tras cualquier modificación o actualización.',
    areaIds: ['area-emision-informes']
  },
  {
    id: 'num-7-11-3',
    codigo: '7.11.3',
    requisito: 'Protección de sistemas de información contra acceso no autorizado, manipulación indebida, integridad de datos, registro de fallos y copias de seguridad.',
    areaIds: ['area-emision-informes']
  },
  {
    id: 'num-7-11-6',
    codigo: '7.11.6',
    requisito: 'Comprobar los cálculos y las transferencias de datos de manera apropiada y sistemática.',
    areaIds: ['area-emision-informes', 'area-ensayos-calibracion']
  },

  // ==========================================
  // CAPÍTULO 8: REQUISITOS DEL SISTEMA DE GESTIÓN
  // ==========================================
  {
    id: 'num-8-1-1',
    codigo: '8.1.1',
    requisito: 'El laboratorio debe establecer, documentar, implementar y mantener un sistema de gestión de acuerdo con la Opción A o la Opción B.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-8-2-1',
    codigo: '8.2.1',
    requisito: 'La dirección debe establecer, documentar y mantener políticas y objetivos para el cumplimiento de esta norma asegurando su comprensión e implementación en todos los niveles.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-8-2-2',
    codigo: '8.2.2',
    requisito: 'Las políticas y objetivos deben abordar la competencia, la imparcialidad y la operación coherente del laboratorio.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-8-2-3',
    codigo: '8.2.3',
    requisito: 'La dirección debe suministrar evidencia del compromiso con el desarrollo, implementación y mejora continua de la eficacia del sistema de gestión.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-8-2-4',
    codigo: '8.2.4',
    requisito: 'Toda la documentación, procesos, sistemas y registros relacionados se deben incluir, referenciar o vincular al sistema de gestión.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-8-2-5',
    codigo: '8.2.5',
    requisito: 'Todo el personal involucrado en actividades debe tener acceso a las partes de la documentación del sistema de gestión aplicables a sus responsabilidades.',
    areaIds: ['area-direccion-calidad', 'area-talento-humano']
  },
  {
    id: 'num-8-3-1',
    codigo: '8.3.1',
    requisito: 'El laboratorio debe controlar los documentos (internos y externos) relacionados con el cumplimiento de esta norma.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-8-3-2',
    codigo: '8.3.2',
    requisito: 'Procedimiento de control de documentos: aprobación previa, revisión periódica, identificación de cambios y versión vigente, disponibilidad en puntos de uso y prevención de uso de obsoletos.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-8-4-1',
    codigo: '8.4.1',
    requisito: 'El laboratorio debe establecer y conservar registros legibles para demostrar el cumplimiento de los requisitos.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-8-4-2',
    codigo: '8.4.2',
    requisito: 'Controles para identificación, almacenamiento, protección, copias de seguridad, archivo, recuperación, tiempo de retención y disposición de registros.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-8-5-1',
    codigo: '8.5.1',
    requisito: 'El laboratorio debe considerar los riesgos y las oportunidades asociados con las actividades para asegurar resultados previstos, prevenir impactos indeseados y lograr la mejora.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-8-5-2',
    codigo: '8.5.2',
    requisito: 'Planificar acciones para abordar riesgos y oportunidades, integrarlas en el sistema de gestión y evaluar su eficacia.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-8-5-3',
    codigo: '8.5.3',
    requisito: 'Las acciones tomadas para abordar riesgos y oportunidades deben ser proporcionales al impacto potencial sobre la validez de los resultados.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-8-6-1',
    codigo: '8.6.1',
    requisito: 'El laboratorio debe identificar y seleccionar oportunidades de mejora e implementar cualquier acción necesaria.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-8-6-2',
    codigo: '8.6.2',
    requisito: 'El laboratorio debe buscar y analizar la retroalimentación de los clientes (positiva y negativa) para mejorar el sistema de gestión y el servicio.',
    areaIds: ['area-direccion-calidad', 'area-servicio-cliente']
  },
  {
    id: 'num-8-7-1',
    codigo: '8.7.1',
    requisito: 'Ante no conformidades: reaccionar, controlar, corregir, hacer frente a consecuencias, evaluar causas raíz para evitar recurrencia, implementar acciones y revisar eficacia.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-8-7-3',
    codigo: '8.7.3',
    requisito: 'Conservar registros de la naturaleza de las no conformidades, causas, acciones tomadas y resultados de las acciones correctivas.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-8-8-1',
    codigo: '8.8.1',
    requisito: 'Llevar a cabo auditorías internas a intervalos planificados para verificar conformidad con requisitos propios del laboratorio y de la norma ISO/IEC 17025.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-8-8-2',
    codigo: '8.8.2',
    requisito: 'Programa de auditoría interna: definir criterios/alcance, seleccionar auditores imparciales, informar resultados a la dirección, implementar correcciones y conservar registros.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-8-9-1',
    codigo: '8.9.1',
    requisito: 'La dirección debe revisar el sistema de gestión a intervalos planificados para asegurar su conveniencia, adecuación y eficacia.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-8-9-2',
    codigo: '8.9.2',
    requisito: 'Entradas para la revisión por la dirección: cambios internos/externos, objetivos, políticas, estado de acciones previas, auditorías, no conformidades, quejas, recursos y riesgos.',
    areaIds: ['area-direccion-calidad']
  },
  {
    id: 'num-8-9-3',
    codigo: '8.9.3',
    requisito: 'Salidas de la revisión por la dirección: decisiones y acciones sobre eficacia del sistema, mejora de actividades, provisión de recursos y necesidades de cambio.',
    areaIds: ['area-direccion-calidad']
  }
];

/**
 * Comparador numérico jerárquico para códigos de numerales ISO (ej: 4.1.1 < 4.1.2 < 4.2.1 < 5.3 < 7.8.6.1)
 */
export function compareNumeralCodes(a, b) {
  const codeA = (typeof a === 'string' ? a : (a?.codigo || a?.subnumeral || '')).trim();
  const codeB = (typeof b === 'string' ? b : (b?.codigo || b?.subnumeral || '')).trim();

  if (!codeA && !codeB) return 0;
  if (!codeA) return 1;
  if (!codeB) return -1;

  // Segmentar por puntos, espacios o guiones
  const partsA = codeA.split(/[.\s-]+/);
  const partsB = codeB.split(/[.\s-]+/);
  
  const maxLength = Math.max(partsA.length, partsB.length);
  for (let i = 0; i < maxLength; i++) {
    const partA = partsA[i] || '';
    const partB = partsB[i] || '';

    const numA = parseInt(partA, 10);
    const numB = parseInt(partB, 10);

    if (!isNaN(numA) && !isNaN(numB)) {
      if (numA !== numB) {
        return numA - numB;
      }
      // Si el número base es igual, comparar sufijos alfabéticos (ej "4.1a" vs "4.1b")
      const alphaA = partA.replace(/^\d+/, '');
      const alphaB = partB.replace(/^\d+/, '');
      if (alphaA !== alphaB) {
        return alphaA.localeCompare(alphaB);
      }
    } else if (!isNaN(numA)) {
      return -1;
    } else if (!isNaN(numB)) {
      return 1;
    } else {
      const cmp = partA.localeCompare(partB, undefined, { numeric: true, sensitivity: 'base' });
      if (cmp !== 0) return cmp;
    }
  }

  return codeA.localeCompare(codeB, undefined, { numeric: true });
}

/**
 * Ordena un array de numerales de menor a mayor jerárquicamente
 */
export function sortNumerals(list = []) {
  if (!Array.isArray(list)) return [];
  return [...list].sort(compareNumeralCodes);
}
