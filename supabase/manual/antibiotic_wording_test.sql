-- BIOTICWAW (test project only): replace mineral and vitamin wording in antibiotic texts.
-- Run once in the SQL editor of bioticwaw-test. Safe to run twice (replacements do nothing the second time).

update public.antibiotic_interactions set
  with_ar = replace(replace(replace(with_ar,
      'مضادات الحموضة والكالسيوم والحديد والزنك والألبان','مضادات الحموضة ومنتجات الألبان'),
      'مضادات الحموضة والحديد والبزموث','مضادات الحموضة'),
      'مضادات الحموضة الحاوية على ماغنيسيوم تريسيليكات','مضادات الحموضة'),
  desc_ar = replace(replace(replace(replace(desc_ar,
      'مضادات الحموضة الحاوية على ماغنيسيوم تريسيليكات','مضادات الحموضة'),
      'مضادات الألومنيوم والماغنيسيوم','مضادات الحموضة'),
      'مضادات الحموضة والكالسيوم والحديد والزنك والألبان','مضادات الحموضة ومنتجات الألبان'),
      'مضادات الحموضة والحديد والبزموث','مضادات الحموضة'),
  with_en = replace(replace(replace(with_en,
      'Antacids, calcium, iron, zinc, dairy','Antacids, dairy products'),
      'Antacids, iron, bismuth','Antacids'),
      'Magnesium trisilicate antacids','Antacids'),
  desc_en = replace(replace(replace(desc_en,
      'Aluminium and magnesium antacids','Antacids'),
      'aluminium and magnesium antacids','antacids'),
      'Antacids, calcium, iron, zinc, dairy','Antacids, dairy products')
where (with_ar||desc_ar||with_en||desc_en) ~* 'فيتامين|معدن|حديد|كالسيوم|زنك|مغنيسيوم|ماغنيسيوم|ألومنيوم|بزموث|vitamin|mineral|iron|calcium|zinc|magnesium|aluminium|aluminum|bismuth';

update public.antibiotics set
  interactions_ar = replace(replace(replace(replace(interactions_ar,
      'مضادات الحموضة (ألومنيوم، كالسيوم، ماغنيسيوم)، والحديد، والبزموث، : ','مضادات الحموضة: '),
      'مضادات الحموضة (ألومنيوم، كالسيوم، ماغنيسيوم)','مضادات الحموضة'),
      'مضادات الحموضة الحاوية على ماغنيسيوم تريسيليكات','مضادات الحموضة'),
      'مضادات الألومنيوم والماغنيسيوم','مضادات الحموضة'),
  interactions_en = replace(replace(replace(interactions_en,
      'Antacids (aluminium, calcium, magnesium), iron, bismuth','Antacids'),
      'Magnesium trisilicate antacids','Antacids'),
      'Aluminium and magnesium antacids','Antacids'),
  timing_ar = replace(timing_ar,'مضادات الألومنيوم والماغنيسيوم','مضادات الحموضة'),
  updated_at = now()
where (interactions_ar||timing_ar||interactions_en||timing_en) ~* 'فيتامين|معدن|حديد|كالسيوم|زنك|مغنيسيوم|ماغنيسيوم|ألومنيوم|بزموث|vitamin|mineral|iron|calcium|zinc|magnesium|aluminium|aluminum|bismuth';

update public.sources set
  title = replace(replace(title,'Antacids','Antacids'),'calcium and iron','antacids'),
  use_ar = replace(replace(replace(use_ar,
      'مضادات الحموضة والكالسيوم والحديد والزنك والألبان','مضادات الحموضة ومنتجات الألبان'),
      'مضادات الألومنيوم والماغنيسيوم','مضادات الحموضة'),
      'مضادات الحموضة والحديد','مضادات الحموضة'),
  use_en = replace(replace(use_en,'Antacids, calcium, iron, zinc, dairy','Antacids, dairy products'),'aluminium and magnesium antacids','antacids')
where (title||use_ar||use_en) ~* 'فيتامين|معدن|حديد|كالسيوم|زنك|مغنيسيوم|ماغنيسيوم|ألومنيوم|vitamin|mineral|iron|calcium|zinc|magnesium|aluminium|aluminum';

-- check: every count below must be 0
select
 (select count(*) from antibiotics where (interactions_ar||timing_ar||uses_ar||dose_ar||renal_ar||interactions_en||timing_en||uses_en||dose_en||renal_en) ~* 'فيتامين|معدن|حديد|كالسيوم|زنك|مغنيسيوم|ماغنيسيوم|ألومنيوم|بزموث|vitamin|mineral|iron|calcium|zinc|magnesium|aluminium|aluminum|bismuth') as antibiotics_left,
 (select count(*) from antibiotic_interactions where (with_ar||desc_ar||with_en||desc_en) ~* 'فيتامين|معدن|حديد|كالسيوم|زنك|مغنيسيوم|ماغنيسيوم|ألومنيوم|بزموث|vitamin|mineral|iron|calcium|zinc|magnesium|aluminium|aluminum|bismuth') as interactions_left,
 (select count(*) from sources where (title||use_ar||use_en) ~* 'فيتامين|معدن|حديد|كالسيوم|زنك|مغنيسيوم|ماغنيسيوم|ألومنيوم|vitamin|mineral|iron|calcium|zinc|magnesium|aluminium|aluminum') as sources_left;
